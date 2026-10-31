import { user } from '../data/medications'
import { Icon } from './Icon'
import { PackLoadingIllustration } from './PackLoadingIllustration'

interface HomeEmptyHeroProps {
  /** Opens the step-by-step setup screen. It does not load anything itself. */
  onLoad: () => void
  /** "Good morning, Margaret", shown above the heading. */
  greeting: string
}

/**
 * The empty Home screen as one clear feature: what to do on the left, what it
 * involves on the right. Visual exploration, scoped to this state only.
 */
export function HomeEmptyHero({ onLoad, greeting }: HomeEmptyHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__copy">
        <p className="home-hero__greeting">{greeting}</p>
        <h1 id="home-hero-title" className="home-hero__title">
          Load your pharmacy pack
        </h1>
        <p className="home-hero__lead">
          Your routine appears once it&rsquo;s loaded.
        </p>
        <button type="button" className="home-hero__action" onClick={onLoad}>
          Load medication
          <Icon name="arrowRight" size={26} strokeWidth={2.2} />
        </button>
        <p className="home-hero__badge">
          <Icon name="shieldCheck" size={22} />
          <span>Prepared by {user.pharmacy}</span>
        </p>
      </div>

      <figure className="home-hero__figure">
        <PackLoadingIllustration />
        <figcaption className="home-hero__caption">
          Please insert your prescription in the back slot.
        </figcaption>
      </figure>
    </section>
  )
}

