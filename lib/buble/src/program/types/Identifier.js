import Node from '../Node.js';
import isReference from '../../utils/isReference.js';
import { loopStatement } from '../../utils/patterns.js';

const names = 'Infinity,undefined,NaN,isFinite,isNaN,' +
  'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
  'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
  'require,' + // for webpack
  'arguments';

const globalVars = Object.create(null);
names.split(',').forEach(name => {
	globalVars[name] = true;
});

const isDeclaration = type => /Declaration$/.test(type);
const isFunction = type => /Function(Expression|Declaration)$/.test(type);

export default class Identifier extends Node {
	findScope(functionScope) {
		if (this.parent.params && ~this.parent.params.indexOf(this)) {
			return this.parent.body.scope;
		}

		if (this.parent.type === 'FunctionExpression' && this === this.parent.id) {
			return this.parent.body.scope;
		}

		return this.parent.findScope(functionScope);
	}

	initialise(transforms) {
		if (isReference(this, this.parent)) {
			if (
				transforms.arrow &&
				this.name === 'arguments' &&
				!this.findScope(false).contains(this.name)
			) {
				const lexicalBoundary = this.findLexicalBoundary();
				const arrowFunction = this.findNearest('ArrowFunctionExpression');
				const loop = this.findNearest(loopStatement);

				if (arrowFunction && arrowFunction.depth > lexicalBoundary.depth) {
					this.alias = lexicalBoundary.getArgumentsAlias();
				}

				if (
					loop &&
					loop.body.contains(this) &&
					loop.depth > lexicalBoundary.depth
				) {
					this.alias = lexicalBoundary.getArgumentsAlias();
				}
			}

			this.findScope(false).addReference(this);
		}
	}

	transpile(code) {
		if (this.alias) {
			code.overwrite(this.start, this.end, this.alias, {
				storeName: true,
				contentOnly: true
			});
		}
		if (
			// not id of a Declaration
			!(isDeclaration(this.parent.type) && this.parent.id === this) &&
			// not a params of a function
			!(isFunction(this.parent.type) && this.parent.params.indexOf(this) > -1) &&
			// not a key of Property
			!(this.parent.type === 'Property' && this.parent.key === this && !this.parent.computed) &&
			// not a property of a MemberExpression
			!(this.parent.type === 'MemberExpression' && this.parent.property === this && !this.parent.computed) &&
			// not in an Array destructure pattern
			!(this.parent.type === 'ArrayPattern') &&
			// not in an Object destructure pattern
			!(this.parent.parent.type === 'ObjectPattern') &&
			// skip globals + commonly used shorthands
			!globalVars[this.name] &&
			// not already in scope
			!this.findScope(false).contains(this.name)
		) {
			this.program.options._varsMap[this.name] = true;
			code.overwrite(this.start, this.end, `_vm.${this.name}`);
		}
	}
}
