import { ComponentLifeCycles, ComponentClass } from './Component'
import { update as _update, render as _render, getRef as _getRef, callUp as _callUp } from '../lib'

declare type Update = typeof _update
declare type Render = typeof _render
declare type GetRef = typeof _getRef
declare type CallUp = typeof _callUp

export as namespace Asnow
export default Asnow

export declare const update: Update
export declare const render: Render
export declare const getRef: GetRef
export declare const callUp: CallUp

export {
  ComponentLifeCycles, ComponentClass
}

declare namespace Asnow {
  const update: Update
  const render: Render
  const getRef: GetRef
  const callUp: CallUp
}
