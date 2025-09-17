import { Module } from '../data/types/index.js';
import { ModuleCard } from '../components/ModuleCard.js';
import { Navigation } from '../components/Navigation.js';

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
  private navigation: Navigation;

  constructor(container: HTMLElement, props: LandingPageProps) {
    this.props = props;
    this.element = this.createElement();
    
    // Initialize navigation
    this.navigation = new Navigation(container, {
      modules: props.modules,
      currentModule: undefined,
      currentLesson: undefined
    });
    
    container.appendChild(this.element);
    this.initializeModuleCards();
    this.initializeSmoothScrolling();
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
      <section class="hero" id="hero">
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
            <div class="hero__stats">
              <div class="hero__stat">
                <span class="hero__stat-number">${courseStats.totalModules}</span>
                <span class="hero__stat-label">Modules</span>
              </div>
              <div class="hero__stat">
                <span class="hero__stat-number">${courseStats.totalLessons}</span>
                <span class="hero__stat-label">Lessons</span>
              </div>
              <div class="hero__stat">
                <span class="hero__stat-number">0</span>
                <span class="hero__stat-label">Prerequisites</span>
              </div>
            </div>
            <div class="hero__actions">
              <a href="#modules" class="btn btn-primary btn-lg hero__cta">
                Start Learning
                <span class="hero__cta-icon">🚀</span>
              </a>
              <a href="#about" class="btn btn-secondary btn-lg">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <section class="about" id="about">
        <div class="container">
          <div class="about__content">
            <h2>What You'll Learn</h2>
            <div class="about__features">
              <div class="about__feature">
                <div class="about__feature-icon">🏗️</div>
                <h3>HTML Structure</h3>
                <p>Learn the building blocks of web pages and how to create semantic, accessible markup.</p>
              </div>
              <div class="about__feature">
                <div class="about__feature-icon">🎨</div>
                <h3>CSS Styling</h3>
                <p>Master the art of styling with modern CSS, including layouts, animations, and responsive design.</p>
              </div>
              <div class="about__feature">
                <div class="about__feature-icon">📱</div>
                <h3>Responsive Design</h3>
                <p>Create websites that look great on all devices, from mobile phones to desktop computers.</p>
              </div>
              <div class="about__feature">
                <div class="about__feature-icon">🚀</div>
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
      <section class="modules" id="modules">
        <div class="container">
          <div class="modules__header">
            <h2>Course Modules</h2>
            <p class="modules__description">
              Follow our structured learning path to build your portfolio website step by step.
              Each module builds on the previous one, ensuring you understand every concept.
            </p>
          </div>
          <div class="modules__grid" id="modules-grid">
            <!-- Module cards will be inserted here -->
          </div>
        </div>
      </section>
    `;
  }

  private initializeModuleCards(): void {
    const modulesGrid = this.element.querySelector('#modules-grid');
    if (!modulesGrid) return;

    this.props.modules.forEach((module, index) => {
      // Demo progress for first few modules
      const progress = index === 0 ? 25 : index === 1 ? 75 : 0;
      
      const moduleCard = new ModuleCard({
        module,
        progress,
        onClick: (clickedModule) => {
          this.handleModuleClick(clickedModule);
        }
      });
      
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
    // Update navigation to show current module
    this.navigation.updateProps({
      modules: this.props.modules,
      currentModule: module.id,
      currentLesson: undefined
    });
    
    // For now, show an alert - in a real app this would navigate to the module page
    alert(`Opening module: ${module.title}\n\nNavigation updated to show current module context.\nThis would navigate to the module page with ${module.lessons.length} lessons.`);
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
    this.element.remove();
  }
}