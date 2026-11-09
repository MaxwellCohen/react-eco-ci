'use client';
import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

// A counter driven entirely by server actions, so it works without JS (progressive enhancement):
//  - useActionState(action, 0): `action` is a server reference passed from the server component
//  - <form action={dispatch}> + the "+" button's name/value
//  - "-" and "reset" use the button `formAction` prop. React drops name/value from such buttons, so each gets a wrapper:
//    hydrated, it sets `op` and calls dispatch; in SSR, its $$FORM_ACTION points the button at a server action (`opAction`,
//    with `op` and the current count bound) (the form's own $ACTION_KEY field is submitted too), so the no-JS postback still updates the state.
// Fizz suspends until a bound server reference's args are encoded, then retries: it must see the *same* bound function
// each time (a fresh .bind() per retry would suspend forever), so cache by op+count.
const bound = new Map();
const boundOp = (opAction, op, count) => {
  const k = `${op}:${count}`;
  if (!bound.has(k)) bound.set(k, opAction.bind(null, op, count));
  return bound.get(k);
};

function Buttons({ dispatch, count, opAction }) {
  const { pending } = useFormStatus();
  const formAction = op => {
    const f = fd => { fd.set('op', op); dispatch(fd); };
    f.$$FORM_ACTION = prefix => {
      return boundOp(opAction, op, count).$$FORM_ACTION(prefix);
    };
    return f;
  };
  return (
    <p>
      <button className="counter" type="submit" name="op" value="inc" disabled={pending}>+</button>{' '}
      <button type="submit" disabled={pending} formAction={formAction('dec')}>-</button>{' '}
      <button type="submit" disabled={pending} formAction={formAction('reset')}>reset</button>{' '}
      {pending && <em>updating…</em>}
    </p>
  );
}

export default function FormCounter({ action, opAction }) {
  const [count, dispatch, isPending] = useActionState(action, 0);
  return (
    <form action={dispatch} data-pending={isPending}>
      <p>Count: <output id="count">{count}</output></p>
      <label>step <input name="step" type="number" defaultValue={1} min={1} style={{ width: 60 }} /></label>
      <Buttons dispatch={dispatch} count={count} opAction={opAction} />
      <p><small>useActionState + server action + button formAction, React {React.version}</small></p>
    </form>
  );
}
