import { ModuleCard, ModuleCardProps } from './ModuleCard.js';
import { sampleModules } from '../data/sampleData.js';

export class ModuleCardDemo {
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body;
    this.init();
  }

  private init(): void {
    this.container.innerHTML = `
      <div class="container">
        <div class="header">
          <h1>Module Card Component Demo</h1>
          <p>Interactive demonstration of the ModuleCard component with different states</p>
        </div>
        
        <div class="main">
          <section class="demo-section">
            <h2>Module Cards Grid</h2>
            <div class="grid grid-cols-3" id="module-grid"></div>
          </section>
          
          <section class="demo-section">
            <h2>Module Cards with Progress</h2>
            <div class="grid grid-cols-2" id="progress-grid"></div>
          </section>
        </div>
      </div>
    `;

    this.renderModuleGrid();
    this.renderProgressExamples();
  }

  private renderModuleGrid(): void {
    const gridContainer = document.getElementById('module-grid');
    if (!gridContainer) return;

    sampleModules.forEach(module => {
      const moduleCard = new ModuleCard({
        module,
        onClick: (clickedModule) => {
          console.log('Module clicked:', clickedModule.title);
          alert(`You clicked on: ${clickedModule.title}`);
        }
      });

      gridContainer.appendChild(moduleCard.getElement());
    });
  }

  private renderProgressExamples(): void {
    const progressContainer = document.getElementById('progress-grid');
    if (!progressContainer) return;

    // Example with 25% progress
    const moduleWithProgress25 = new ModuleCard({
      module: sampleModules[0],
      progress: 25,
      onClick: (module) => {
        console.log('Module with 25% progress clicked:', module.title);
      }
    });

    // Example with 75% progress
    const moduleWithProgress75 = new ModuleCard({
      module: sampleModules[1],
      progress: 75,
      onClick: (module) => {
        console.log('Module with 75% progress clicked:', module.title);
      }
    });

    progressContainer.appendChild(moduleWithProgress25.getElement());
    progressContainer.appendChild(moduleWithProgress75.getElement());

    // Demo progress update after 2 seconds
    setTimeout(() => {
      moduleWithProgress25.updateProgress(50);
      moduleWithProgress75.updateProgress(100);
    }, 2000);
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ModuleCardDemo('app');
  });
} else {
  new ModuleCardDemo('app');
}