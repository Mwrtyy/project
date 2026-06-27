import { portfolio } from '../data/content.js';

export class Router {
  constructor({ onRouteChange }) {
    this.onRouteChange = onRouteChange;
    this.currentRoute = 'home';
    this.links = [];
    this.handleClick = this.handleClick.bind(this);
  }

  init() {
    this.links = Array.from(document.querySelectorAll('[data-route-link]'));
    document.addEventListener('click', this.handleClick);
    const start = window.location.hash.replace('#/', '') || 'home';
    this.go(portfolio.routes.includes(start) ? start : 'home', false);
  }

  handleClick(event) {
    const link = event.target.closest('[data-route-link]');
    if (!link) return;
    const route = link.dataset.routeLink;
    if (!portfolio.routes.includes(route)) return;
    event.preventDefault();
    this.go(route, true);
  }

  go(route, updateHash = true) {
    if (!portfolio.routes.includes(route)) return;
    const apply = () => {
      this.currentRoute = route;
      document.body.dataset.route = route;
      document.querySelectorAll('[data-view]').forEach((view) => view.classList.toggle('is-active', view.dataset.view === route));
      this.links.forEach((link) => link.classList.toggle('is-active', link.dataset.routeLink === route));
      if (updateHash) window.location.hash = `/${route}`;
      this.onRouteChange?.(route);
    };
    if (document.startViewTransition) document.startViewTransition(apply);
    else apply();
  }

  destroy() {
    document.removeEventListener('click', this.handleClick);
  }
}
