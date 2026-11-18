import Modal from './modal';

export const dynamic = 'force-dynamic';

export default function ModalPage() {
  return (
    <main>
      <h1>Modal with static server children</h1>
      <p>The terms below are static server output that only mounts after the click.</p>
      <Modal>
        <section id="terms">
          <h2>Terms</h2>
          <p>These terms are rendered by a Server Component and passed as children.</p>
          <ul>{Array.from({ length: 20 }, (_, i) => <li key={i}>Clause {i + 1}</li>)}</ul>
        </section>
      </Modal>
    </main>
  );
}
