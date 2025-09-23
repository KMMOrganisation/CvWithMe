import { Module } from '../data/types/index.js';
import { ModuleCard } from '../components/ModuleCard.js';
import { Navigation } from '../components/Navigation.js';
import { progressNavigationManager } from '../utils/progressNavigationManager.js';

export interface LandingPageProps {
  modules: Module[];
  courseStats: {
    totalModules: number;
    totalLessons: number;
    totalContentBlocks: number;
  };
}

export class LandingPage {
  private props: LandingPageProps;
  private element: HTMLElement;

  private moduleCards: Map<number, ModuleCard> = new Map();
  private progressUnsubscribe?: () => void;

  constructor(container: HTMLElement, props: LandingPageProps) {
    this.props = props;
    this.element = this.createElement();
    
    // Initialize navigation
    new Navigation(container, {
      modules: props.modules,
      currentModule: undefined,
      currentLesson: undefined
    });
    
    container.appendChild(this.element);
    this.initializeModuleCards();
    this.initializeSmoothScrolling();
    this.setupProgressTracking();
  }

  private createElement(): HTMLElement {
    const page = document.createElement('div');
    page.className = 'landing-page';
    
    page.innerHTML = `
      ${this.createHeroSection()}
      ${this.createModulesSection()}
    `;

    return page;
  }

  private createHeroSection(): string {
    const { courseStats } = this.props;
    
    return `
      <section class="hero" id="hero" role="banner">
        <div class="container">
          <div class="hero__content">
            <h1 class="hero__title">
              Code Your Dream Portfolio
              <span class="hero__subtitle">From Zero to Web Hero!</span>
            </h1>
            <p class="hero__description lead">
              Ready to build your very own online portfolio, even if you've never written a line of code? 
              This course is for you! We'll start from scratch, writing every piece of code together, step-by-step.
            </p>
            <div class="hero__stats" role="group" aria-labelledby="course-stats-heading">
              <h2 id="course-stats-heading" class="sr-only">Course Statistics</h2>
              <div class="hero__stat">
                <span class="hero__stat-number" aria-label="${courseStats.totalModules} modules">${courseStats.totalModules}</span>
                <span class="hero__stat-label">Modules</span>
              </div>
              <div class="hero__stat">
                <span class="hero__stat-number" aria-label="${courseStats.totalLessons} lessons">${courseStats.totalLessons}</span>
                <span class="hero__stat-label">Lessons</span>
              </div>
              <div class="hero__stat">
                <span class="hero__stat-number" aria-label="Zero prerequisites">0</span>
                <span class="hero__stat-label">Prerequisites</span>
              </div>
            </div>
            <div class="hero__actions">
              <a href="#modules" class="btn btn-primary btn-lg hero__cta" aria-describedby="start-learning-desc">
                Start Learning
                <span class="hero__cta-icon" aria-hidden="true">🚀</span>
              </a>
              <span id="start-learning-desc" class="sr-only">Jump to course modules section</span>
              <a href="#about" class="btn btn-secondary btn-lg" aria-describedby="learn-more-desc">
                Learn More
              </a>
              <span id="learn-more-desc" class="sr-only">Learn more about what you'll build in this course</span>
            </div>
          </div>
        </div>
      </section>
      
      <section class="about" id="about" aria-labelledby="about-heading">
        <div class="container">
          <div class="about__content">
            <h2 id="about-heading">What You'll Learn</h2>
            <div class="about__features" role="list">
              <div class="about__feature" role="listitem">
                <div class="about__feature-icon" aria-hidden="true">🏗️</div>
                <h3>HTML Structure</h3>
                <p>Learn the building blocks of web pages and how to create semantic, accessible markup.</p>
              </div>
              <div class="about__feature" role="listitem">
                <div class="about__feature-icon" aria-hidden="true">🎨</div>
                <h3>CSS Styling</h3>
                <p>Master the art of styling with modern CSS, including layouts, animations, and responsive design.</p>
              </div>
              <div class="about__feature" role="listitem">
                <div class="about__feature-icon" aria-hidden="true">📱</div>
                <h3>Responsive Design</h3>
                <p>Create websites that look great on all devices, from mobile phones to desktop computers.</p>
              </div>
              <div class="about__feature" role="listitem">
                <div class="about__feature-icon" aria-hidden="true">🚀</div>
                <h3>Portfolio Creation</h3>
                <p>Build a professional portfolio website that showcases your skills and projects.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  private createModulesSection(): string {
    return `
      <main class="modules" id="modules" role="main" aria-labelledby="modules-heading">
        <div class="container">
          <div class="modules__header">
            <h2 id="modules-heading">Course Modules</h2>
            <p class="modules__description">
              Follow our structured learning path to build your portfolio website step by step.
              Each module builds on the previous one, ensuring you understand every concept.
            </p>
          </div>
          <div class="modules__grid" id="modules-grid" role="list" aria-label="Course modules">
            <!-- Module cards will be inserted here -->
          </div>
        </div>
      </main>
    `;
  }

  private initializeModuleCards(): void {
    const modulesGrid = this.element.querySelector('#modules-grid');
    if (!modulesGrid) return;

    this.props.modules.forEach((module) => {
      // Get actual progress from progress tracker
      const moduleProgress = progressNavigationManager.getModuleProgress(module.id);
      const completedLessons = moduleProgress?.completedLessons || 0;
      
      const moduleCard = new ModuleCard({
        module,
        completedLessons,
        progress: moduleProgress?.percentage || 0,
        onClick: (clickedModule) => {
          this.handleModuleClick(clickedModule);
        }
      });
      
      this.moduleCards.set(module.id, moduleCard);
      modulesGrid.appendChild(moduleCard.getElement());
    });
  }

  private initializeSmoothScrolling(): void {
    // Add smooth scroll behavior to navigation links
    const navLinks = this.element.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  private handleModuleClick(module: Module): void {
    // Navigate to module using the progress navigation manager
    progressNavigationManager.navigateToModule(module.id);
    
    // For now, show an alert - in a real app this would navigate to the module page
    alert(`Opening module: ${module.title}\n\nNavigation updated to show current module context.\nThis would navigate to the module page with ${module.lessons.length} lessons.\n\nURL updated to: ${progressNavigationManager.getShareableURL()}`);
  }

  private setupProgressTracking(): void {
    // Subscribe to progress changes to update module cards
    this.progressUnsubscribe = progressNavigationManager.subscribe((event) => {
      if (event.type === 'progress' || event.type === 'combined') {
        // Update all module cards with latest progress
        this.props.modules.forEach((module) => {
          const moduleCard = this.moduleCards.get(module.id);
          if (moduleCard) {
            const moduleProgress = progressNavigationManager.getModuleProgress(module.id);
            if (moduleProgress) {
              moduleCard.updateProgress(moduleProgress.completedLessons, moduleProgress.percentage);
            }
          }
        });
      }
    });
  }

  public updateProps(newProps: Partial<LandingPageProps>): void {
    this.props = { ...this.props, ...newProps };
    
    // Re-render if modules changed
    if (newProps.modules) {
      const modulesGrid = this.element.querySelector('#modules-grid');
      if (modulesGrid) {
        modulesGrid.innerHTML = '';
        this.initializeModuleCards();
      }
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public destroy(): void {
    // Cleanup progress tracking subscription
    this.progressUnsubscribe?.();
    
    // Cleanup module cards
    this.moduleCards.forEach(card => card.destroy());
    this.moduleCards.clear();
    
    this.element.remove();
  }
}