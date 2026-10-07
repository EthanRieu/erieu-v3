import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Système de reveal maison, extrait tel quel de pages/index.vue pour être partagé par toutes les pages.
 *
 * Classes reconnues (inchangées) :
 *   reveal-title, reveal-text, reveal-text-staggered (groupées par conteneur .space-y-6/8/10),
 *   reveal-divider, reveal-element, reveal-project-N, reveal-tool (groupés par parent), reveal-cta.
 *
 * Fonctionnement : chaque élément est pré-caché via gsap.set() au montage, puis révélé une seule fois
 * par un ScrollTrigger individuel (onEnter, once: true, marquage .animated pour éviter les doublons).
 *
 * prefers-reduced-motion : tout est enveloppé dans gsap.matchMedia(). Si l'utilisateur demande moins
 * d'animations, rien n'est caché ni animé (contenu visible d'emblée) ; si la préférence change en cours
 * de session, GSAP rétablit les styles initiaux.
 *
 * Usage (dans <script setup>) :  const { refresh } = useRevealAnimations()
 */

const PROJECT_SELECTOR = '[class^="reveal-project-"], [class*=" reveal-project-"]'

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useRevealAnimations(options = {}) {
    const { root = null } = options

    let matchMedia = null
    let scrollTriggerInstances = []
    let hoverListeners = []

    const scope = () => (root && root.value) || document
    const query = (selector) => Array.from(scope().querySelectorAll(selector))
    const setIfAny = (elements, vars) => {
        if (elements.length) gsap.set(elements, vars)
    }
    const track = (instance) => {
        scrollTriggerInstances.push(instance)
    }
    const listen = (el, type, fn) => {
        el.addEventListener(type, fn)
        hoverListeners.push({ el, type, fn })
    }

    // Pré-cacher tous les éléments animés pour éviter le flash (offsets réduits sur mobile)
    const preHideAnimatedElements = () => {
        const mobile = window.innerWidth < 640

        setIfAny(query('.reveal-title'), { y: 100, opacity: 0, skewY: 5 })
        setIfAny(query('.reveal-text'), { y: mobile ? 15 : 30, opacity: 0 })
        setIfAny(query('.reveal-text-staggered'), { y: mobile ? 10 : 20, opacity: 0 })
        setIfAny(query('.reveal-divider'), { scaleX: 0, transformOrigin: 'left center' })
        setIfAny(query('.reveal-element'), { scale: 0.9, opacity: 0 })
        query(PROJECT_SELECTOR).forEach((project, index) => {
            const offset = mobile ? 20 : 50
            gsap.set(project, { x: index % 2 === 0 ? -offset : offset, opacity: 0 })
        })
        setIfAny(query('.reveal-tool'), { y: 30, opacity: 0 })
        setIfAny(query('.reveal-cta'), { y: 20, opacity: 0 })
    }

    // Révèle `target` une seule fois lorsque `trigger` entre dans le viewport
    const revealOnce = ({ trigger, target, marker = trigger, start, from, to }) => {
        track(ScrollTrigger.create({
            trigger,
            start,
            once: true,
            onEnter: () => {
                if (marker.classList.contains('animated')) return
                gsap.fromTo(target, from, {
                    ...to,
                    onComplete: () => marker.classList.add('animated')
                })
            }
        }))
    }

    const animateBigTitles = () => {
        query('.reveal-title').forEach((title) => revealOnce({
            trigger: title, target: title, start: 'top 90%',
            from: { y: 100, opacity: 0, skewY: 5 },
            to: { y: 0, opacity: 1, skewY: 0, duration: 1.2, ease: 'power3.out' }
        }))
    }

    const animateTexts = () => {
        query('.reveal-text').forEach((text) => revealOnce({
            trigger: text, target: text, start: 'top 95%',
            from: { y: 30, opacity: 0 },
            to: { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
        }))
    }

    const animateStaggeredTexts = () => {
        query('.space-y-6, .space-y-8, .space-y-10').forEach((group) => {
            const staggeredTexts = group.querySelectorAll('.reveal-text-staggered')
            if (!staggeredTexts.length) return
            revealOnce({
                trigger: group, target: staggeredTexts, start: 'top 95%',
                from: { y: 20, opacity: 0 },
                to: { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' }
            })
        })
    }

    const animateDividers = () => {
        query('.reveal-divider').forEach((divider) => revealOnce({
            trigger: divider, target: divider, start: 'top 95%',
            from: { scaleX: 0, transformOrigin: 'left center' },
            to: { scaleX: 1, duration: 1, ease: 'power3.inOut' }
        }))
    }

    const animateElements = () => {
        query('.reveal-element').forEach((element) => revealOnce({
            trigger: element, target: element, start: 'top 95%',
            from: { scale: 0.9, opacity: 0 },
            to: { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)' }
        }))
    }

    const animateProjects = () => {
        query(PROJECT_SELECTOR).forEach((project, index) => revealOnce({
            trigger: project, target: project, start: 'top 95%',
            from: { x: index % 2 === 0 ? -50 : 50, opacity: 0 },
            to: { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
        }))
    }

    // Les outils sont animés en cascade par groupe (parent commun) : une grille = un ScrollTrigger
    const animateTools = () => {
        const groups = new Map()
        query('.reveal-tool').forEach((tool) => {
            const parent = tool.parentElement
            if (!groups.has(parent)) groups.set(parent, [])
            groups.get(parent).push(tool)
        })
        groups.forEach((tools, parent) => revealOnce({
            trigger: tools[0], target: tools, marker: parent, start: 'top 95%',
            from: { y: 30, opacity: 0 },
            to: { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        }))
    }

    const animateCTAs = () => {
        query('.reveal-cta').forEach((cta) => {
            revealOnce({
                trigger: cta, target: cta, start: 'top 95%',
                from: { y: 20, opacity: 0 },
                to: { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
            })
            listen(cta, 'mouseenter', () => gsap.to(cta, { scale: 1.05, duration: 0.3, ease: 'power1.out' }))
            listen(cta, 'mouseleave', () => gsap.to(cta, { scale: 1, duration: 0.3, ease: 'power1.out' }))
        })
    }

    const cleanup = () => {
        scrollTriggerInstances.forEach((instance) => instance && instance.kill && instance.kill())
        scrollTriggerInstances = []
        hoverListeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn))
        hoverListeners = []
    }

    const init = () => {
        if (!import.meta.client) return

        gsap.registerPlugin(ScrollTrigger)
        matchMedia = gsap.matchMedia()

        matchMedia.add('(prefers-reduced-motion: no-preference)', () => {
            preHideAnimatedElements()
            animateBigTitles()
            animateTexts()
            animateStaggeredTexts()
            animateDividers()
            animateElements()
            animateProjects()
            animateTools()
            animateCTAs()
            return cleanup
        })

        // Les positions de déclenchement dépendent de la mise en page : on les recalcule une fois la police chargée
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => ScrollTrigger.refresh())
        }
    }

    const destroy = () => {
        cleanup()
        if (matchMedia) {
            matchMedia.revert()
            matchMedia = null
        }
    }

    onMounted(() => {
        nextTick(init)
    })

    onBeforeUnmount(destroy)

    return {
        refresh: () => ScrollTrigger.refresh(),
        destroy
    }
}
