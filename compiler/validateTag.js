// Validate the given element tag name.
// code reference:
// https://github.com/mathiasbynens/is-potential-custom-element-name
// https://github.com/sindresorhus/validate-element-name

// https://html.spec.whatwg.org/multipage/scripting.html#prod-potentialcustomelementname
const customElementRegx = /^[a-z](?:[-.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-(?:[-.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;

// https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name
const reservedNames = [
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph'
];

export function isComponentTag(name) {
  if (!/-/.test(name)) return false;
  if (!customElementRegx.test(name)) return false;
	if (reservedNames.indexOf(name) !== -1) return false;
  if (/^(polymer-|x-|ng-|xml|[^a-z])/.test(name)) return false;
  const parts = name.split('-');
  for (let part of parts) {
    if (!/^[0-9a-z_]+$/.test(part)) return false;
  }
  return true;
}

