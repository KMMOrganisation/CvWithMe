/**
 * Animation and Micro-interaction Utilities
 * Provides smooth animations, scroll-based reveals, and enhanced UX interactions
 */

interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  stagger?: number;
}

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  stagger?: number;
}

class AnimationUtils {
  private static instance: AnimationUtils;
  private intersectionObserver: IntersectionObserver | null = null;
  private prefersReducedMotion: boolean = false;

  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.initializeScrollReveal();
  }

  static getInstance(): AnimationUtils {
    if (!AnimationUtils.instance) {
      AnimationUtils.instance = new AnimationUtils();
    }
    return AnimationUtils.instance;
  }

  /**
   * Initialize scroll-based reveal animations
   */
  private initializeScrollReveal(): void {
    if (this.prefersReducedMotion) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const delay = parseInt(element.dataset.delay || '0');
            
            setTimeout(() => {
              element.classList.add('revealed');
            }, delay);

            if (element.dataset.once === 'true') {
              this.intersectionObserver?.unobserve(element);
            }
          } else {
            const element = entry.target as HTMLElement;
            if (element.dataset.once !== 'true') {
              element.classList.remove('revealed');
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  }

  /**
   * Add scroll reveal animation to elements
   */
  addScrollReveal(selector: string, options: ScrollRevealOptions = {}): void {
    if (this.prefersReducedMotion) return;

    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      
      // Add base class
      htmlElement.classList.add('scroll-reveal');
      
      // Set options as data attributes
      if (options.once !== false) {
        htmlElement.dataset.once = 'true';
      }
      
      // Add stagger delay
      if (options.stagger) {
        htmlElement.dataset.delay = (index * options.stagger).toString();
      }
      
      // Observe element
      this.intersectionObserver?.observe(htmlElement);
    });
  }

  /**
   * Animate element entrance with stagger effect
   */
  animateEntrance(selector: string, options: AnimationOptions = {}): void {
    if (this.prefersReducedMotion) return;

    const elements = document.querySelectorAll(selector);
    const { stagger = 100, delay = 0 } = options;

    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const totalDelay = delay + (index * stagger);
      
      htmlElement.style.animationDelay = `${totalDelay}ms`;
      htmlElement.classList.add('page-enter-stagger');
    });
  }

  /**
   * Add enhanced hover effects to cards
   */
  enhanceCards(selector: string = '.card'): void {
    const cards = document.querySelectorAll(selector);
    
    cards.forEach(card => {
      const htmlCard = card as HTMLElement;
      
      // Add enhanced class
      htmlCard.classList.add('card-enhanced');
      
      // Add performance optimization
      htmlCard.classList.add('will-change-transform');
      
      // Remove will-change after animation
      htmlCard.addEventListener('transitionend', () => {
        if (!htmlCard.matches(':hover')) {
          htmlCard.classList.remove('will-change-transform');
        }
      });
      
      htmlCard.addEventListener('mouseenter', () => {
        htmlCard.classList.add('will-change-transform');
      });
    });
  }

  /**
   * Add enhanced button interactions
   */
  enhanceButtons(selector: string = '.btn'): void {
    const buttons = document.querySelectorAll(selector);
    
    buttons.forEach(button => {
      const htmlButton = button as HTMLElement;
      
      // Add enhanced class
      htmlButton.classList.add('btn-enhanced');
      
      // Add ripple effect on click
      htmlButton.addEventListener('click', (e) => {
        if (this.prefersReducedMotion) return;
        
        const rect = htmlButton.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple 0.6s linear;
          left: ${x}px;
          top: ${y}px;
          width: 20px;
          height: 20px;
          margin-left: -10px;
          margin-top: -10px;
          pointer-events: none;
        `;
        
        htmlButton.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  /**
   * Add smooth progress bar animations
   */
  animateProgress(selector: string, targetWidth: number, duration: number = 1000): void {
    const progressBars = document.querySelectorAll(selector);
    
    progressBars.forEach(bar => {
      const htmlBar = bar as HTMLElement;
      const progressBar = htmlBar.querySelector('.progress-bar') as HTMLElement;
      
      if (progressBar) {
        progressBar.style.setProperty('--progress-width', `${targetWidth}%`);
        progressBar.classList.add('progress-animated');
        
        // Animate width
        let start = 0;
        const startTime = performance.now();
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentWidth = start + (targetWidth - start) * easeOutQuart;
          
          progressBar.style.width = `${currentWidth}%`;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      }
    });
  }

  /**
   * Add loading state animations
   */
  addLoadingState(element: HTMLElement, type: 'pulse' | 'shimmer' | 'spinner' = 'shimmer'): void {
    element.classList.add(`loading-${type}`);
  }

  /**
   * Remove loading state animations
   */
  removeLoadingState(element: HTMLElement): void {
    element.classList.remove('loading-pulse', 'loading-shimmer', 'loading-spinner');
  }

  /**
   * Add success animation
   */
  showSuccess(element: HTMLElement): void {
    if (this.prefersReducedMotion) return;
    
    element.classList.add('state-success');
    setTimeout(() => {
      element.classList.remove('state-success');
    }, 600);
  }

  /**
   * Add error animation
   */
  showError(element: HTMLElement): void {
    if (this.prefersReducedMotion) return;
    
    element.classList.add('state-error');
    setTimeout(() => {
      element.classList.remove('state-error');
    }, 500);
  }

  /**
   * Smooth scroll to element with offset
   */
  smoothScrollTo(target: string | HTMLElement, offset: number = 0): void {
    const element = typeof target === 'string' 
      ? document.querySelector(target) as HTMLElement
      : target;
    
    if (!element) return;
    
    const targetPosition = element.offsetTop - offset;
    
    if (this.prefersReducedMotion) {
      window.scrollTo(0, targetPosition);
      return;
    }
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * Add stagger animation to a group of elements
   */
  staggerAnimation(selector: string, animationClass: string, staggerDelay: number = 100): void {
    if (this.prefersReducedMotion) return;
    
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      
      setTimeout(() => {
        htmlElement.classList.add(animationClass);
      }, index * staggerDelay);
    });
  }

  /**
   * Initialize all enhancements
   */
  initializeAll(): void {
    // Add scroll reveals
    this.addScrollReveal('.card', { stagger: 100, once: true });
    this.addScrollReveal('.module-card', { stagger: 150, once: true });
    this.addScrollReveal('.lesson-card', { stagger: 100, once: true });
    
    // Enhance interactive elements
    this.enhanceCards();
    this.enhanceButtons();
    
    // Add entrance animations for page content
    setTimeout(() => {
      this.animateEntrance('.card', { stagger: 100, delay: 200 });
    }, 100);
  }

  /**
   * Clean up observers and event listeners
   */
  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }
}

// CSS for ripple effect
const rippleCSS = `
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
`;

// Add ripple CSS to document
if (!document.querySelector('#ripple-styles')) {
  const style = document.createElement('style');
  style.id = 'ripple-styles';
  style.textContent = rippleCSS;
  document.head.appendChild(style);
}

// Export singleton instance
export const animationUtils = AnimationUtils.getInstance();

// Auto-initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    animationUtils.initializeAll();
  });
} else {
  animationUtils.initializeAll();
}

export default AnimationUtils;