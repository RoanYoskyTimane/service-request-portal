import { useEffect, useState } from 'react';
import type { components } from './api/schema';

type ServiceRequestPage = components['schemas']['ServiceRequestPage'];

export default function App() {
  const [data, setData] = useState<ServiceRequestPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/requests')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Carregando mocks...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>MSW Verification</h1>
      <p>Total de registos encontrados: <strong>{data?.total}</strong></p>
      <ul>
        {data?.items.map((item) => (
          <li key={item.id}>
            <strong>[{item.id}] {item.title}</strong> - Status: <em>{item.status}</em> | Prioridade: {item.priority}
          </li>
        ))}
      </ul>
    </div>
  );
}