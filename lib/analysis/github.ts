const REST = "https://api.github.com";
const GQL = "https://api.github.com/graphql";

function headers(token: string, extra: Record<string, string> = {}) {
  return { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "fabric-agents-grtec", ...extra };
}

export async function ghRest<T = any>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${REST}${path}`;
  const res = await fetch(url, { ...init, headers: headers(token, (init.headers as any) ?? {}), cache: "no-store" });
  if (res.status === 429 || res.status === 403) throw new Error(`GitHub rate limit. Espera.`);
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

export async function ghGraphQL<T = any>(token: string, query: string, variables: Record<string, any> = {}): Promise<T> {
  const res = await fetch(GQL, { method: "POST", headers: headers(token, { "Content-Type": "application/json" }), body: JSON.stringify({ query, variables }), cache: "no-store" });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = (await res.json()) as any;
  if (json.errors?.length) throw new Error(`GraphQL: ${json.errors[0].message}`);
  return json.data as T;
}