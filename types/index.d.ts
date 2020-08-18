import { ComponentLifeCycles, ComponentClass } from './Component'
import { update as _update, render as _render } from '../lib'

declare type Update = typeof _update
declare type Render = typeof _render

export as namespace Asnow
export default Asnow

export declare const update: Update
export declare const render: Render

export {
  ComponentLifeCycles, ComponentClass
}

declare namespace Asnow {
  const update: Update
  const render: Render
}
