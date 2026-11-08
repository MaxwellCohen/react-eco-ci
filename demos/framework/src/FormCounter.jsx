'use client';
import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

// A counter driven entirely by form actions:
//  - useActionState(reducer, 0) gives [state, dispatch, isPending]
//  - <form action={dispatch}> runs the reducer on submit (the default "+" button)
//  - buttons override it with the `formAction` prop: one passes `dispatch` directly (with name/value),
//    the other passes an inline function that builds its own FormData
async function reducer(count, formData) {
  await new Promise(r => setTimeout(r, 150)); // visible pending state
  const op = formData.get('op');
  const step = Number(formData.get('step') || 1);
  if (op === 'reset') return 0;
  return op === 'dec' ? count - step : count + step;
}

function Buttons({ dispatch }) {
  const { pending } = useFormStatus();
  return (
    <p>
      <button className="counter" type="submit" name="op" value="inc" disabled={pending}>+</button>{' '}
      <button type="submit" name="op" value="dec" formAction={dispatch} disabled={pending}>-</button>{' '}
      <button type="submit" disabled={pending} formAction={() => { const fd = new FormData(); fd.set('op', 'reset'); dispatch(fd); }}>reset</button>{' '}
      {pending && <em>updating…</em>}
    </p>
  );
}

export default function FormCounter() {
  const [count, dispatch, isPending] = useActionState(reducer, 0);
  return (
    <form action={dispatch} data-pending={isPending}>
      <p>Count: <output id="count">{count}</output></p>
      <label>step <input name="step" type="number" defaultValue={1} min={1} style={{ width: 60 }} /></label>
      <Buttons dispatch={dispatch} />
      <p><small>useActionState + form action + button formAction props, React {React.version}</small></p>
    </form>
  );
}
