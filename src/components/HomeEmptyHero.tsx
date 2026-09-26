import { user } from '../data/medications'
import { Icon } from './Icon'
import { PackLoadingIllustration } from './PackLoadingIllustration'

interface HomeEmptyHeroProps {
  /** Opens the step-by-step setup screen. It does not load anything itself. */
  onLoad: () => void
}

/**
 * The empty Home screen as one clear feature: what to do on the left, what it
 * involves on the right. Visual exploration, scoped to this state only.
 */
export function HomeEmptyHero({ onLoad }: HomeEmptyHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__copy">
        <h1 id="home-hero-title" className="home-hero__title">
          Load your pharmacy pack
        </h1>
        <p className="home-hero__lead">
          Load your prepared pack to see today&rsquo;s medication routine. The next screen shows
          you how.
        </p>
        <button type="button" className="home-hero__action" onClick={onLoad}>
          Load medication
          <Icon name="arrowRight" size={26} strokeWidth={2.2} />
        </button>
        <p className="home-hero__note">Prepared by {user.pharmacy}.</p>
      </div>

      <figure className="home-hero__figure">
        <PackLoadingIllustration />
        <figcaption className="home-hero__caption">
          The pack goes behind the door on the back of {user.deviceName}.
        </figcaption>
      </figure>
    </section>
  )
}
