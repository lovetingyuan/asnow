function isElement(node) {
    return !!node && (node instanceof HTMLElement || node.nodeType === 1);
}
function isComment(node) {
    return node.nodeType === 8;
}
function isText(node) {
    return node.nodeType === 3;
}
function toFunc(exp) {
    const func = new Function(`with(this) { return (${exp}) }`); // eslint-disable-line
    if (process.env.NODE_ENV === 'unit_test') {
        func.toString = () => exp;
    }
    return func;
}
function isComponent(el) {
    if (typeof el === 'string') {
        return el.indexOf('-') > 0;
    }
    return isElement(el) && el.tagName.indexOf('-') > 0;
}
function CamelToHyphen(name) {
    const cname = [name[0].toLowerCase()];
    for (let i = 1; i < name.length; i++) {
        if (/[A-Z]/.test(name[i])) {
            cname.push('-');
            cname.push(name[i].toLowerCase());
        }
        else {
            cname.push(name[i]);
        }
    }
    return cname.join('');
}

function compile(component) {
    if ('meta' in component)
        return component;
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(component.template.trim(), 'text/html');
    if (!doc.body.firstElementChild || doc.body.firstElementChild.nodeType !== 1) {
        throw new Error(`Invalid template of component ${component.name}`);
    }
    if (doc.body.childNodes.length !== 1) {
        throw new Error('Component template must only have one root element.' + component.name);
    }
    const componentsMap = component.components || {};
    Object.keys(componentsMap).forEach(name => {
        if (!isComponent(name)) {
            const comp = componentsMap[name];
            delete componentsMap[name];
            componentsMap[CamelToHyphen(name)] = comp;
        }
    });
    component.components = componentsMap;
    const meta = parseElement(doc.body.firstElementChild, componentsMap);
    const compiledComponent = component;
    compiledComponent.meta = meta;
    return compiledComponent;
}
function parseElementOrComponent(element, components) {
    return isComponent(element) ? parseComponent(element, components) : parseElement(element, components);
}
function parseConditions(elements, components) {
    var _a, _b, _c;
    const conditionMeta = {
        type: 'condition',
        conditions: []
    };
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const conditionBlock = {
            type: '',
            condition: null,
            node: null
        };
        if (i === 0) {
            const value = (_a = element.getAttribute('#if')) === null || _a === void 0 ? void 0 : _a.trim();
            if (!value)
                throw new Error('#if can not be empty.');
            conditionBlock.type = 'if';
            conditionBlock.condition = toFunc(`!!(${value})`);
            element.removeAttribute('#if');
        }
        else if (i === elements.length - 1 && element.hasAttribute('#else')) {
            const value = (_b = element.getAttribute('#else')) === null || _b === void 0 ? void 0 : _b.trim();
            if (value)
                throw new Error('#else must be empty.');
            conditionBlock.type = 'else';
            conditionBlock.condition = () => true;
            element.removeAttribute('#else');
        }
        else { // elif
            const value = (_c = element.getAttribute('#elif')) === null || _c === void 0 ? void 0 : _c.trim();
            if (!value)
                throw new Error('#elif can not be empty.');
            conditionBlock.condition = toFunc(`!!(${value})`);
            element.removeAttribute('#elif');
        }
        conditionBlock.node = parseElementOrComponent(element, components);
        conditionMeta.conditions.push(conditionBlock);
    }
    return conditionMeta;
}
function parseComponent(node, components) {
    const attrs = [...node.attributes];
    const propsExpression = '{' + attrs.map(({ name, value }) => {
        value = value.trim();
        if (value[0] === '{' && value[value.length - 1] === '}') {
            value = value.slice(1, -1);
        }
        else {
            value = JSON.stringify(value);
        }
        return `${JSON.stringify(name)}:(${value}),`;
    }) + '}';
    const tagName = node.tagName.toLowerCase();
    if (!components[tagName]) {
        throw new Error(`component ${tagName} can not be resolved.`);
    }
    return {
        type: 'component',
        component: compile(components[tagName]),
        props: toFunc(propsExpression)
    };
}
function parseTextNode(node) {
    var _a;
    const text = (_a = node.textContent) !== null && _a !== void 0 ? _a : '';
    const isStatic = !/\{[^}]+?\}/.test(text);
    return {
        type: 'text',
        text: isStatic ? text : toFunc('`' + text.replace(/\{/g, '${') + '`'),
        static: isStatic
    };
}
function parseLoop(element, components) {
    var _a;
    const loopMeta = {
        type: 'loop',
        loop: null,
        item: null,
        node: null
    };
    const value = (_a = element.getAttribute('#for')) === null || _a === void 0 ? void 0 : _a.trim();
    if (!value)
        throw new Error('#for can not be empty.');
    const forExps = value.split(/ +(of|by) +/).map(v => v.trim()).filter(Boolean);
    if (forExps.length !== 3 && forExps.length !== 5) {
        throw new Error('Invalid #for value: ' + value);
    }
    const item = forExps[0];
    const list = forExps[2];
    const key = forExps[4];
    if (/^\(.+\)$/.test(item)) {
        const _item = item.slice(1, -1).split(',').map(v => v.trim()).filter(Boolean);
        if (_item.length > 2)
            throw new Error('Invalid #for value: ' + value);
        loopMeta.item = _item[0];
        if (_item[1])
            loopMeta.index = _item[1];
    }
    else {
        loopMeta.item = item;
    }
    if (key) {
        loopMeta.key = toFunc(key);
    }
    loopMeta.loop = toFunc(list);
    element.removeAttribute('#for');
    loopMeta.node = parseElementOrComponent(element, components);
    return loopMeta;
}
function parseChildren(childNodes, components) {
    var _a;
    const childrenMeta = [];
    // let staticCount = 0
    const conditionNodes = [];
    for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        if (!isElement(child) && !isText(child))
            continue;
        // blank, if, elif, else, other
        if (isElement(child)) { // handle directives at first
            if (child.hasAttribute('#if')) {
                if (conditionNodes.length) {
                    childrenMeta.push(parseConditions([...conditionNodes], components));
                    conditionNodes.length = 0;
                }
                conditionNodes.push(child);
            }
            else if (child.hasAttribute('#elif')) {
                if (conditionNodes.length) {
                    conditionNodes.push(child);
                }
                else {
                    throw new Error('#elif must be next to #if');
                }
            }
            else if (child.hasAttribute('#else')) {
                if (conditionNodes.length) {
                    conditionNodes.push(child);
                    childrenMeta.push(parseConditions([...conditionNodes], components));
                    conditionNodes.length = 0;
                }
                else {
                    throw new Error('#else must be next to #if or #elif');
                }
            }
            else {
                if (conditionNodes.length) {
                    childrenMeta.push(parseConditions([...conditionNodes], components));
                    conditionNodes.length = 0;
                }
                if (child.hasAttribute('#for')) {
                    childrenMeta.push(parseLoop(child, components));
                }
                else {
                    childrenMeta.push(parseElementOrComponent(child, components));
                }
            }
        }
        else if (isText(child)) {
            if ((_a = child.textContent) === null || _a === void 0 ? void 0 : _a.trim()) {
                if (conditionNodes.length) {
                    childrenMeta.push(parseConditions(conditionNodes.slice(), components));
                    conditionNodes.length = 0;
                }
                childrenMeta.push(parseTextNode(child));
            }
            else if (!conditionNodes.length) { // else ignore blank node between condition nodes
                childrenMeta.push({
                    type: 'text', static: true, text: ' '
                });
            }
        }
    }
    if (conditionNodes.length) {
        childrenMeta.push(parseConditions([...conditionNodes], components));
        conditionNodes.length = 0;
    }
    return childrenMeta;
}
function parseElement(element, components) {
    const eventListnerExp = /^([^(]+?)\(([^)]+?)\)$/;
    let actions;
    let bindings;
    const attrs = [...element.attributes];
    attrs.forEach(({ name, value }) => {
        value = value.trim();
        if (name[0] === '@') {
            actions = actions || {};
            const actionExp = value.match(eventListnerExp);
            if (actionExp) {
                actions[name.slice(1)] = [actionExp[1].trim(), toFunc('[' + actionExp[2] + ']')];
            }
            else {
                actions[name.slice(1)] = [value];
            }
            element.removeAttribute(name);
            return;
        }
        if (value[0] === '{' && value[value.length - 1] === '}') {
            bindings = bindings || {};
            bindings[name] = toFunc(value.slice(1, -1));
            element.removeAttribute(name);
            return;
        }
    });
    const meta = {
        type: 'element',
        element: null
    };
    // if (staticCount === children.length && !actions && !bindings) {
    //   meta.element = cloneElement(element)
    //   meta.static = true
    //   return meta
    // }
    const childrenMeta = parseChildren([...element.childNodes], components);
    element.innerHTML = '';
    meta.element = element.cloneNode(true);
    if (actions) {
        meta.actions = actions;
    }
    if (bindings) {
        meta.bindings = bindings;
    }
    if (childrenMeta.length) {
        meta.children = childrenMeta;
    }
    return meta;
}

function renderElementOrComponent(meta) {
    if (meta.type === 'element') {
        return renderElement.call(this, meta);
    }
    return renderComponent.call(this, meta);
}
function renderCondition(meta) {
    const index = meta.conditions.findIndex(cd => cd.condition.call(this));
    if (index === -1)
        return document.createComment('if');
    const { node } = meta.conditions[index];
    const element = renderElementOrComponent.call(this, node);
    element._if = index;
    return element;
}
function renderLoop(meta) {
    const list = meta.loop.call(this);
    if (!list.length)
        return document.createComment('for');
    const frag = document.createDocumentFragment();
    const keys = [];
    const ctx = Object.create(this);
    let _val, _index;
    Object.defineProperty(ctx, meta.item, {
        get() { return _val; }
    });
    if (meta.index) {
        Object.defineProperty(ctx, meta.index, {
            get() { return _index; }
        });
    }
    list.forEach((val, index) => {
        [_val, _index] = [val, index];
        const key = meta.key ? meta.key.call(ctx) : index;
        if (keys.includes(key))
            throw new Error('Repeat key in #for ' + key);
        keys.push(key);
        const element = renderElementOrComponent.call(ctx, meta.node);
        if (index === 0)
            element._for = keys;
        frag.appendChild(element);
    });
    return frag;
}
function renderNode(meta) {
    if (meta.type === 'component') {
        return renderComponent.call(this, meta);
    }
    if (meta.type === 'condition') {
        return renderCondition.call(this, meta);
    }
    if (meta.type === 'loop') {
        return renderLoop.call(this, meta);
    }
    if (meta.type === 'element') {
        return renderElement.call(this, meta);
    }
    if (meta.type === 'text') {
        if (typeof meta.text === 'string') {
            return document.createTextNode(meta.text);
        }
        return document.createTextNode(meta.text.call(this));
    }
}
function renderElement(meta) {
    const element = meta.element.cloneNode(true);
    if (meta.bindings) {
        Object.entries(meta.bindings).forEach(([name, val]) => {
            element.setAttribute(name, val.call(this) + '');
        });
    }
    if (meta.actions) {
        const listeners = element._listeners = {};
        Object.entries(meta.actions).forEach(([action, handler]) => {
            const [method, args] = handler;
            const _handler = (event) => {
                const _args = args ? args.call(this) : [];
                _args.push(event);
                return this[method](..._args);
            };
            element.addEventListener(action, _handler);
            element.dataset.event = 'true';
            listeners[action] = _handler;
        });
    }
    if (meta.children) {
        const frag = document.createDocumentFragment();
        meta.children.forEach(child => {
            const node = renderNode.call(this, child);
            node && frag.appendChild(node);
        });
        element.appendChild(frag);
    }
    return element;
}
const VMap = new Map();
const vmidSymbol = Symbol('vmid');
const propsSymbol = Symbol('props');
if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window._vmap = VMap;
}
function renderComponent(meta) {
    const Component = meta.component;
    const props = meta.props.call(this);
    const vm = new Component(props);
    const vmid = Component.name + '-' + VMap.size;
    vm[vmidSymbol] = vmid;
    vm[propsSymbol] = props;
    VMap.set(vmid, vm);
    const element = renderElement.call(vm, Component.meta);
    element.dataset.vmid = vmid;
    return element;
}
// render root component
function render(component, target) {
    if (typeof target === 'string') {
        target = document.querySelector(target);
    }
    if (target instanceof HTMLElement) {
        const compiledComponent = compile(component);
        target.appendChild(renderComponent.call({}, {
            type: 'component', component: compiledComponent, props: () => ({})
        }));
    }
    else {
        throw new Error(`invalid target: ${target}`);
    }
}

function assertNodeType(meta, node) {
    if (meta.type === 'element' && isElement(node))
        return node;
    if (meta.type === 'component' && isElement(node) && node.dataset.vmid)
        return node;
    if (meta.type === 'condition') {
        if (isComment(node))
            return node;
        if (isElement(node) && typeof node._if === 'number')
            return node;
    }
    if (meta.type === 'loop') {
        if (isComment(node))
            return node;
        if (isElement(node) && Array.isArray(node._for))
            return node;
    }
    if (meta.type === 'text' && isText(node))
        return node;
    if (process.env.NODE_ENV === 'development')
        console.error(meta, node);
    throw new Error('Unmatched meta and node');
}
function updateElement(element, meta) {
    var _a;
    if (meta.bindings) { // update attributes
        Object.entries(meta.bindings).forEach(([name, val]) => {
            const oldVal = element.getAttribute(name);
            const newVal = val.call(this);
            if (newVal !== oldVal)
                element.setAttribute(name, newVal);
        });
    }
    if (meta.children) { // update childNodes
        const childNodes = [...element.childNodes];
        for (let i = 0, j = 0; i < meta.children.length; i++, j++) {
            const childMeta = meta.children[i];
            const childNode = childNodes[j];
            assertNodeType(childMeta, childNode);
            if (childMeta.type === 'element') {
                updateElement.call(this, childNode, childMeta);
            }
            else if (childMeta.type === 'text') {
                if (typeof childMeta.text === 'function') {
                    const oldText = childNode.textContent;
                    const newText = childMeta.text.call(this);
                    if (oldText !== newText)
                        childNode.textContent = newText;
                }
            }
            else if (childMeta.type === 'component') {
                updateComponent.call(this, childNode, childMeta);
            }
            else if (childMeta.type === 'condition') {
                assertNodeType(childMeta, childNode);
                updateCondition.call(this, childNode, childMeta);
            }
            else if (childMeta.type === 'loop') {
                const node = childNode;
                j += (((_a = node._for) === null || _a === void 0 ? void 0 : _a.length) || 1) - 1;
                updateLoop.call(this, node, childMeta);
            }
        }
    }
}
// remove event listeners and components
function cleanElement(element, remove) {
    const components = [...element.querySelectorAll('[data-vmid]')];
    const listeners = [...element.querySelectorAll('[data-event]')];
    if (element.dataset.vmid)
        components.push(element);
    if (element.dataset.event)
        listeners.push(element);
    listeners.forEach((el) => {
        const listenersMap = el._listeners;
        Object.entries(listenersMap).forEach(([action, handler]) => {
            el.removeEventListener(action, handler);
        });
    });
    components.forEach((el) => {
        const vmid = el.dataset.vmid;
        if (!vmid || !VMap.has(vmid))
            throw new Error(`vmid ${vmid} in document but not in vmmap`);
        const vm = VMap.get(vmid);
        if (typeof vm.BeforeRemove === 'function') {
            vm.BeforeRemove();
        }
        VMap.delete(vmid);
    });
    if (remove === true) {
        element.remove();
    }
    else {
        element.replaceWith(remove);
    }
}
function updateComponent(element, meta) {
    const vmid = element.dataset.vmid;
    const vm = VMap.get(vmid);
    if (!vm)
        throw new Error(`Can not find vm instance of ${vmid}`);
    const newProps = meta.props.call(this);
    if (typeof vm.PropsUpdate === 'function') {
        vm.PropsUpdate(newProps, vm[propsSymbol]);
    }
}
function updateELementOrComponent(element, meta) {
    if (meta.type === 'element') {
        updateElement.call(this, element, meta);
    }
    else {
        updateComponent.call(this, element, meta);
    }
}
function updateCondition(childNode, childMeta) {
    const targetIndex = childMeta.conditions.findIndex(({ condition }) => condition.call(this));
    if (targetIndex === -1) {
        if (isComment(childNode))
            return;
        cleanElement(childNode, document.createComment('if'));
        return;
    }
    const conditionBlock = childMeta.conditions[targetIndex];
    const conditionMeta = conditionBlock.node;
    if (isComment(childNode)) {
        const element = renderElementOrComponent.call(this, conditionMeta);
        element._if = targetIndex;
        childNode.replaceWith(element);
    }
    else {
        if (childNode._if === targetIndex) {
            updateELementOrComponent.call(this, childNode, conditionMeta);
        }
        else {
            const newElement = renderElementOrComponent.call(this, conditionMeta);
            newElement._if = targetIndex;
            cleanElement(childNode, newElement);
        }
    }
}
function updateLoop(childNode, childMeta) {
    const list = childMeta.loop.call(this);
    const parent = childNode.parentElement;
    if (!parent)
        throw new Error('Error in #for update, no parent element.');
    if (list.length === 0) {
        if (isComment(childNode))
            return;
        let prevLen = childNode._for.length;
        while (--prevLen) {
            const el = childNode.nextSibling;
            if (!isElement(el))
                throw new Error('Error in #for update');
            cleanElement(el, true);
        }
        cleanElement(childNode, document.createComment('for'));
        return;
    }
    if (isComment(childNode)) {
        const frag = document.createDocumentFragment();
        const keys = [];
        const ctx = Object.create(this);
        let _val, _index;
        Object.defineProperty(ctx, childMeta.item, {
            get() { return _val; }
        });
        if (childMeta.index) {
            Object.defineProperty(ctx, childMeta.index, {
                get() { return _index; }
            });
        }
        list.forEach((val, index) => {
            [_val, _index] = [val, index];
            const key = childMeta.key ? childMeta.key.call(ctx) : index;
            if (keys.includes(key))
                throw new Error('Repeat key in #for ' + key);
            keys.push(key);
            const element = renderElementOrComponent.call(ctx, childMeta.node);
            if (index === 0)
                element._for = keys;
            frag.appendChild(element);
        });
        parent.insertBefore(frag, childNode);
        childNode.remove();
        return;
    }
    const prevKeys = childNode._for;
    const currentElementsMap = {};
    let element = childNode;
    for (const key of prevKeys) {
        if (!isElement(element))
            throw new Error('Error in #for update, node is not element.');
        if (key in currentElementsMap)
            throw new Error('Repeat key in #for: ' + key);
        currentElementsMap[key] = element;
        element = element.nextSibling;
    }
    const lastElement = element;
    element = childNode;
    const newKeys = [];
    const ctx = Object.create(this);
    let _val, _index;
    Object.defineProperty(ctx, childMeta.item, {
        get() { return _val; }
    });
    if (childMeta.index) {
        Object.defineProperty(ctx, childMeta.index, {
            get() { return _index; }
        });
    }
    list.forEach((val, index) => {
        [_val, _index] = [val, index];
        const key = childMeta.key ? childMeta.key.call(ctx) : index;
        if (newKeys.includes(key))
            throw new Error('Repeat key in #for: ' + key);
        newKeys.push(key);
        let el = currentElementsMap[key];
        if (el) {
            if (el === element) {
                if (index === 0)
                    element._for = newKeys;
                updateELementOrComponent.call(ctx, element, childMeta.node);
                element = element.nextSibling;
                return;
            }
        }
        else {
            el = renderElementOrComponent.call(ctx, childMeta.node);
        }
        if (index === 0)
            el._for = newKeys;
        parent.insertBefore(el, element);
    });
    while (element !== lastElement) {
        const el = element;
        if (!isElement(element))
            throw new Error('Error in #for update, node is not element.');
        element = element.nextSibling;
        cleanElement(el, true);
    }
    // const prevLen = (childNode as any)._for as number
    // const updateLen = Math.min(prevLen, list.length)
    // let element: Node | null = childNode, i = 0
    // for (; i < updateLen; i++) {
    //   if (!isElement(element)) throw new Error('Error in #for update, node is not element.')
    //   const ctx = createLoopCtx.call(this, childMeta, list[i], i)
    //   updateELementOrComponent.call(ctx, element, childMeta.node)
    //   if (i === 0) (element as any)._for = list.length
    //   element = element.nextSibling
    // }
    // if (prevLen < list.length) { // need to add new element
    //   const frag = document.createDocumentFragment()
    //   for (; i < list.length; i++) {
    //     const ctx = createLoopCtx.call(this, childMeta, list[i], i)
    //     const el = renderElementOrComponent.call(ctx, childMeta.node)
    //     frag.appendChild(el)
    //   }
    //   if (element) {
    //     parent.insertBefore(frag, element)
    //   } else {
    //     parent.appendChild(frag)
    //   }
    // } else if (prevLen > list.length) { // need to remove element
    //   if (!isElement(element)) throw new Error('Error in #for update, node is not element.')
    //   for (; i < prevLen - 1; i++) {
    //     const el = element.nextSibling
    //     if (!isElement(el)) throw new Error('Error in #for update, node is not element.')
    //     cleanElement(el, true)
    //   }
    //   cleanElement(element, true)
    // }
}
function update(vm, newState) {
    const newVm = Object.assign(vm, newState);
    const vmid = vm[vmidSymbol];
    const element = document.querySelector(`[data-vmid="${vmid}"]`);
    if (!isElement(element)) {
        throw new Error('Failed to update ' + vmid);
    }
    const component = vm.constructor;
    const meta = component.meta;
    updateElement.call(newVm, element, meta);
}

var index = { render, update };

export default index;
export { render, update };
