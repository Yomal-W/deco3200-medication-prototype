import { useCallback, useEffect, useRef, useState } from 'react'
import type { TabName } from './types'
import { AppHeader } from './components/AppHeader'
import { AppNav } from './components/AppNav'
import { FacilitatorPanel } from './components/FacilitatorPanel'
import { Icon } from './components/Icon'
import { findMedication, user } from './data/medications'
import { usePrefersReducedMotion } from './state/usePrefersReducedMotion'
import { usePrototype } from './state/usePrototype'
import { hashToScreen, screenToHash } from './utils/routes'
import { formatTime, greetingFor } from './utils/time'
import { trayDose } from './utils/travel'
import { TodayScreen } from './screens/TodayScreen'
import { DoseScreen } from './screens/DoseScreen'
import { DispensingScreen } from './screens/DispensingScreen'
import { CollectScreen } from './screens/CollectScreen'
import { CompleteScreen } from './screens/CompleteScreen'
import { WhatsNextScreen } from './screens/WhatsNextScreen'
import { ChangeScreen } from './screens/ChangeScreen'
import { MedicationsScreen } from './screens/MedicationsScreen'
import { MedicationDetailScreen } from './screens/MedicationDetailScreen'
import { SetupScreen } from './screens/SetupScreen'
import { SetupLoadingScreen } from './screens/SetupLoadingScreen'
import { SetupReadyScreen } from './screens/SetupReadyScreen'
import { HelpScreen } from './screens/HelpScreen'
import { AwayScreen } from './screens/AwayScreen'

const tabScreens: TabName[] = ['today', 'medications', 'help']

function App() {
  const {
    stage,
    stocked,
    doses,
    inventory,
    lowStockMedicationId,
    restockRequestedAt,
    change,
    changeAcknowledgedAt,
    trip,
    clock,
    screen,
    navReplace,
    activeDose,
    nextDose,
    canSkipAhead,
    findDose,
    goTo,
    goToTab,
    applyHistoryScreen,
    openSetup,
    startLoading,
    finishLoading,
    openDose,
    startDispensing,
    finishDispensing,
    confirmTaken,
    skipToNextDose,
    acknowledgeChange,
    chooseAwayOption,
    cancelAway,
    startTravelPreparation,
    startTravelDispensing,
    finishTravelDispensing,
    confirmTravelPacked,
    leaveForTrip,
    returnHome,
    reportTravel,
    finishReturnHome,
    requestRestock,
    setStage,
    setLowStockMedication,
    setIncludeChange,
    setClock,
    resetSession,
  } = usePrototype()

  const [facilitatorOpen, setFacilitatorOpen] = useState(false)
  const [hasMoreBelow, setHasMoreBelow] = useState(false)
  const bodyRef = useRef<HTMLElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  // Laptop entry point to facilitator mode. The tablet entry point is five
  // taps on the device mark in the header.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        setFacilitatorOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Keep the URL in step with the current screen.
  useEffect(() => {
    const path = screenToHash(screen)
    if (window.location.hash === path) return
    if (navReplace) window.history.replaceState(null, '', path)
    else window.history.pushState(null, '', path)
  }, [screen, navReplace])

  // Browser Back/Forward — including an accidental iPad edge swipe — moves
  // within the prototype rather than leaving it.
  useEffect(() => {
    const onHistoryMove = () => applyHistoryScreen(hashToScreen(window.location.hash))
    window.addEventListener('popstate', onHistoryMove)
    window.addEventListener('hashchange', onHistoryMove)
    return () => {
      window.removeEventListener('popstate', onHistoryMove)
      window.removeEventListener('hashchange', onHistoryMove)
    }
  }, [applyHistoryScreen])

  // Every screen starts at the top, and the participant is told when there is
  // more content below the fold.
  useEffect(() => {
    const element = bodyRef.current
    if (!element) return

    element.scrollTop = 0
    const update = () =>
      setHasMoreBelow(element.scrollTop + element.clientHeight < element.scrollHeight - 48)

    const frame = window.requestAnimationFrame(update)
    element.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)

    return () => {
      window.cancelAnimationFrame(frame)
      element.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [screen])

  const scrollDown = useCallback(() => {
    const element = bodyRef.current
    if (!element) return
    element.scrollBy({
      top: element.clientHeight * 0.75,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [reduceMotion])

  const goHome = useCallback(() => goTo({ name: 'today' }), [goTo])
  const openAway = useCallback(() => goTo({ name: 'away' }), [goTo])
  const openHelp = useCallback(() => goToTab('help'), [goToTab])
  const inTray = trayDose(doses)
  // A trip waiting on a dose at the station, so it can be picked up again afterwards.
  const tripWaiting = trip?.status === 'reviewing' || trip?.status === 'preparing'
  // Doses from a finished trip that are still out of the station or uncertain.
  const outstandingTravelDoses = doses.filter(
    (dose) =>
      dose.travel?.packedAt &&
      (dose.travel.outcome === 'in-case' || dose.travel.outcome === 'unsure') &&
      !trip?.doseIds.includes(dose.id),
  )
  const openFacilitator = useCallback(() => setFacilitatorOpen(true), [])
  const closeFacilitator = useCallback(() => setFacilitatorOpen(false), [])

  const activeTab = tabScreens.includes(screen.name as TabName) ? (screen.name as TabName) : null
  // Locked waiting states: no navigation while the device is working.
  const isBusy = screen.name === 'dispensing' || screen.name === 'setup-loading'

  const renderScreen = () => {
    switch (screen.name) {
      case 'setup':
        return <SetupScreen onStartLoading={startLoading} onBack={() => goToTab('today')} />

      case 'setup-loading':
        return <SetupLoadingScreen onComplete={finishLoading} />

      case 'setup-ready':
        return <SetupReadyScreen onContinue={() => goToTab('today')} />

      case 'medications':
        return (
          <MedicationsScreen
            stocked={stocked}
            onLoadMedication={openSetup}
            inventory={inventory}
            restockRequestedAt={restockRequestedAt}
            change={change}
            onOpenMedication={(medicationId) => goTo({ name: 'medication', medicationId })}
          />
        )

      case 'medication': {
        const medication = findMedication(screen.medicationId)
        if (!medication) return null
        return (
          <MedicationDetailScreen
            medication={medication}
            level={inventory[medication.id]}
            restockRequestedAt={restockRequestedAt}
            change={change}
            onBack={() => goToTab('medications')}
            onRequestRestock={requestRestock}
            onOpenChange={() => goTo({ name: 'change' })}
          />
        )
      }

      case 'help':
        return (
          <HelpScreen
            onGoToToday={() => goToTab('today')}
            onGoToMedications={() => goToTab('medications')}
          />
        )

      case 'dose': {
        const dose = findDose(screen.doseId)
        if (!dose) return null
        return (
          <DoseScreen
            dose={dose}
            onBack={goHome}
            onDispense={startDispensing}
            trayDoseId={inTray?.id ?? null}
            travelReportable={
              dose.travel?.packedAt != null &&
              !(trip?.status === 'preparing' && trip.doseIds.includes(dose.id))
            }
            onReport={reportTravel}
            onOpenDose={openDose}
            onOpenAway={openAway}
            onGetHelp={openHelp}
          />
        )
      }

      case 'dispensing': {
        const dose = findDose(screen.doseId)
        if (!dose) return null
        return screen.forTravel ? (
          <DispensingScreen dose={dose} onComplete={finishTravelDispensing} forTravel />
        ) : (
          <DispensingScreen dose={dose} onComplete={finishDispensing} />
        )
      }

      case 'collect': {
        const dose = findDose(screen.doseId)
        if (!dose) return null
        return <CollectScreen dose={dose} onConfirm={confirmTaken} onLater={goHome} />
      }

      case 'complete': {
        const dose = findDose(screen.doseId)
        if (!dose) return null
        return (
          <CompleteScreen
            dose={dose}
            onWhatsNext={() => goTo({ name: 'whats-next' })}
            onBackToToday={goHome}
            onResumeTravel={tripWaiting ? openAway : undefined}
          />
        )
      }

      case 'whats-next':
        return (
          <WhatsNextScreen
            doses={doses}
            activeDose={activeDose}
            nextDose={nextDose}
            onOpenDose={openDose}
            onBackToToday={goHome}
          />
        )

      case 'change':
        return change ? (
          <ChangeScreen
            change={change}
            acknowledgedAt={changeAcknowledgedAt}
            onAcknowledge={acknowledgeChange}
            onBackToToday={goHome}
          />
        ) : null

      case 'away':
        return (
          <AwayScreen
            trip={trip}
            doses={doses}
            clock={clock}
            onChooseOption={chooseAwayOption}
            onCancel={cancelAway}
            onStartPreparing={startTravelPreparation}
            onDispense={startTravelDispensing}
            onConfirmPacked={confirmTravelPacked}
            onLeave={leaveForTrip}
            onReturnHome={returnHome}
            onReport={reportTravel}
            onFinishReturn={finishReturnHome}
            onOpenDose={openDose}
            onBackToToday={goHome}
            onGetHelp={openHelp}
          />
        )

      case 'today':
        return (
          <TodayScreen
            stocked={stocked}
            onLoadMedication={openSetup}
            doses={doses}
            activeDose={activeDose}
            nextDose={nextDose}
            change={change}
            changeAcknowledgedAt={changeAcknowledgedAt}
            onOpenDose={openDose}
            onOpenChange={() => goTo({ name: 'change' })}
            onOpenWhatsNext={() => goTo({ name: 'whats-next' })}
            canSkipAhead={canSkipAhead}
            onSkipToNext={skipToNextDose}
            trip={trip}
            outstandingTravelDoses={outstandingTravelDoses}
            onOpenAway={openAway}
            onReturnHome={returnHome}
          />
        )
    }
  }

  return (
    <div className="device">
      <AppHeader
        title={`${greetingFor(clock)}, ${user.firstName}`}
        meta={`${user.today} · ${formatTime(clock)}`}
        onOpenFacilitator={openFacilitator}
        back={
          activeTab || isBusy
            ? undefined
            : screen.name === 'medication'
              ? { label: 'Medications', onClick: () => goToTab('medications') }
              : screen.name === 'setup' || screen.name === 'setup-ready'
                ? { label: 'Today', onClick: () => goToTab('today') }
                : { label: 'Today', onClick: goHome }
        }
      />

      <div className="device__scroll">
        <main className="device__body" ref={bodyRef}>
          <div className="shell">{renderScreen()}</div>
        </main>

        {hasMoreBelow && !isBusy ? (
          <>
            <span className="scroll-fade" aria-hidden="true" />
            <button type="button" className="scroll-hint" onClick={scrollDown}>
              <Icon name="arrowDown" size={20} />
              More below
            </button>
          </>
        ) : null}
      </div>

      {isBusy ? null : <AppNav active={activeTab} onSelect={goToTab} />}

      {facilitatorOpen ? (
        <FacilitatorPanel
          stage={stage}
          clock={clock}
          routineTimes={doses.map((dose) => ({
            id: dose.id,
            label: dose.periodLabel,
            time: formatTime(dose.scheduledMinutes),
            minutes: dose.scheduledMinutes,
          }))}
          onSetClock={(minutes) => {
            setClock(minutes)
            setFacilitatorOpen(false)
          }}
          lowStockMedicationId={lowStockMedicationId}
          includeChange={change !== null}
          onSetStage={(next) => {
            setStage(next)
            setFacilitatorOpen(false)
          }}
          onSetLowStockMedication={setLowStockMedication}
          onSetIncludeChange={setIncludeChange}
          onReset={() => {
            resetSession()
            setFacilitatorOpen(false)
          }}
          onClose={closeFacilitator}
        />
      ) : null}
    </div>
  )
}

export default App
