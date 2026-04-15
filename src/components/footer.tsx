export function Footer() {
  return (
    <footer className="border-t">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-center text-xs text-muted-foreground">
        <p>
          Built by{" "}
          <a
            href="https://github.com/jose2kk"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            jose2kk
          </a>
          .{" "}
          <a
            href="https://github.com/jose2kk/totpstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Source on GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
