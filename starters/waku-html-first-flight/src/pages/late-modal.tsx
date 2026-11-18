import { Modal } from '../components/modal';

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
