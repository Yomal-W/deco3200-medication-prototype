interface PrototypeNoteProps {
  children?: string
}

/** Discreet reminder that nothing here is a real medication record. */
export function PrototypeNote({
  children = 'Prototype only — sample information for user testing.',
}: PrototypeNoteProps) {
  return (
    <p className="prototype-note">
      <span className="prototype-note__dot" aria-hidden="true" />
      {children}
    </p>
  )
}
