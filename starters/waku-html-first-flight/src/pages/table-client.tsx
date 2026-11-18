import { TablePage } from '../components/table-page';

export default async function Page() {
  return <TablePage mode="client" />;
}

export const getConfig = async () => ({ render: 'dynamic' }) as const;
