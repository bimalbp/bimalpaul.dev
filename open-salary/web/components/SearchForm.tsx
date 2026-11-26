// A plain GET form: works with JavaScript off, and every search is a shareable URL.
export function SearchForm({ q = "", city = "", autoFocus = false }: { q?: string; city?: string; autoFocus?: boolean }) {
  return (
    <form action="/" method="get" className="search" role="search">
      <label className="sr-only" htmlFor="q">
        Company or job title
      </label>
      <input id="q" name="q" defaultValue={q} placeholder="Company or job title, e.g. Software Engineer" autoFocus={autoFocus} autoComplete="off" />
      <label className="sr-only" htmlFor="city">
        City
      </label>
      <input id="city" name="city" defaultValue={city} placeholder="City (optional)" className="city" autoComplete="off" />
      <button type="submit">Search</button>
    </form>
  );
}
