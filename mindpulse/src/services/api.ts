// services/api.ts
export const fetchEntries = async (userId: string) => {
  const res = await fetch(`/api/entries?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
};

export const createEntry = async (entry: any) => {
  const res = await fetch(`/api/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to create entry');
  return res.json();
};
