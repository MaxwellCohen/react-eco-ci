import { Modal } from '../components/modal';

// Static server markup passed as `children` to a client component that renders it only after a click.
// With static host elision on, that markup is left out of the first payload and never reaches the HTML,
// so the client has to ask for it (Waku's patch refetches the payload). Click "open" to see it.
export default async function Page() {
  return (
    <main>
      <h1>Late modal</h1>
      <Modal>
        <section id="late">
          <p>This static content is only mounted after a click.</p>
        </section>
      </Modal>
    </main>
  );
}

export const getConfig = async () => ({ render: 'dynamic' }) as const;
