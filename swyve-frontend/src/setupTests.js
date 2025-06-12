import '@testing-library/jest-dom';

HTMLMediaElement.prototype.pause = jest.fn();
HTMLMediaElement.prototype.play  = jest.fn();

class IntersectionObserverMock {
  constructor(callback) { this.callback = callback; }
  observe()  {}
  unobserve(){}
  disconnect(){}
}
global.IntersectionObserver = IntersectionObserverMock;
