import { LeftArrow, RightArrow } from "../scripts/$arrows.js";

const today = new Date().getDay();

for (const [i, day] of Object.entries(document.querySelectorAll<HTMLElement>('.show-today'))) {
  if (today !== +i) {
    day.closest('.panel')?.remove();
  }
}

for (const [, day] of Object.entries(document.querySelectorAll<HTMLElement>('.mystery'))) {
  if (!day.classList.contains(`day-${today}`)) {
    day.closest('.panel')?.remove();
  }
}

class Tab {

  static tabs: Tab[] = [];

  static currentTabIndex = 0;
  static get currentTab() { return Tab.tabs[this.currentTabIndex]!; }

  currentPanel!: Panel;

  constructor(public firstPanel: Panel, private button: HTMLAnchorElement) {
    this.button.onclick = (e) => {
      e.preventDefault();
      this.focus();
    };
  }

  focus() {
    for (const tab of Tab.tabs) tab.button.classList.remove('active');
    Tab.currentTabIndex = Tab.tabs.indexOf(this);
    this.button.classList.add('active');
    this.firstPanel.focus();
  };

}

function animateTo(container: HTMLElement, duration: number, to: { x: number, y: number }) {
  const startPos = {
    x: container.scrollLeft,
    y: container.scrollTop,
  };

  const startedAt = +document.timeline.currentTime!;

  const step = () => {
    requestAnimationFrame(time => {
      const percentDone = (time - startedAt) / duration;
      if (percentDone >= 1) {
        container.scrollLeft = to.x;
        container.scrollTop = to.y;
        return;
      }

      const percentToAnimate = ease(percentDone);

      const x = (to.x - startPos.x) * percentToAnimate + startPos.x;
      const y = (to.y - startPos.y) * percentToAnimate + startPos.y;

      container.scrollLeft = x;
      container.scrollTop = y;

      step();
    });
  };
  step();
}

let ease = easeInOut;

function easeInOut(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

function changeEase() {
  ease = ease === easeInOut ? sillyEase : easeInOut;
}

function sillyEase(x: number): number {
  const c4 = (2 * Math.PI) / 3;
  return x === 0
    ? 0
    : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

class Panel {

  public tab!: Tab;

  public prev?: Panel | undefined;
  public next?: Panel | undefined;

  private lines: HTMLElement[];
  currentLine = 0;

  constructor(
    public panelDiv: HTMLDivElement,
    public panelBodyDiv: HTMLDivElement,
  ) {
    this.lines = [...this.panelBodyDiv.querySelectorAll<HTMLElement>('.highlightable-line')];

    for (const [i, line] of Object.entries(this.lines)) {
      line.onclick = (e) => {
        e.preventDefault();
        this.goToLine(+i);
      };
    }
  }

  hasLines() { return this.lines.length > 0; }

  focus() {
    const container = document.getElementById('tabs-bodies')!;
    animateTo(container, 700, {
      x: this.panelDiv.offsetLeft - container.offsetLeft,
      y: this.panelDiv.offsetTop - container.offsetTop,
    });
    this.panelBodyDiv.focus({ preventScroll: true });

    for (const line of this.lines) {
      line.classList.remove('active');
    }

    this.currentLineEl.classList.add('active');
    this.tab.currentPanel = this;
  }

  goToLine(line: number) {
    this.currentLineEl.classList.remove('active');
    this.currentLine = line;
    this.currentLineEl.classList.add('active');

    const currentLine = this.currentLineEl;
    animateTo(this.panelBodyDiv, 300, {
      x: this.panelBodyDiv.scrollLeft,
      y: currentLine.offsetTop - this.panelBodyDiv.offsetHeight / 2 + currentLine.offsetHeight / 2,
    });
  }

  nextLine() {
    this.goToLine(Math.min(this.currentLine + 1, this.lines.length - 1));
  }

  prevLine() {
    this.goToLine(Math.max(this.currentLine - 1, 0));
  }

  get currentLineEl() {
    return this.lines[this.currentLine]!;
  }

}

let buttonEasterEgg = false;

function changeNavButtons() {
  buttonEasterEgg = !buttonEasterEgg;

  for (const button of document.querySelectorAll<HTMLButtonElement>('.page-changer')) {
    const side = button.classList.contains('side-left') ? 'left' : 'right';
    if (buttonEasterEgg) {
      button.textContent = `Hey, why don't you go to the page on the ${side} by clicking here?`;
    }
    else {
      button.replaceChildren(side === 'left' ? <LeftArrow /> : <RightArrow />);
    }
  }
}

const tabButtons = [...document.querySelectorAll<HTMLAnchorElement>('#tabs-names a')];
for (const slideshow of document.querySelectorAll<HTMLDivElement>('.slideshow')) {
  let lastPanel: Panel | undefined;

  for (const panelDiv of slideshow.querySelectorAll<HTMLDivElement>('.panel')) {
    const panelBodyDiv = panelDiv.querySelector<HTMLDivElement>('.panel-body')!;

    const panel = new Panel(panelDiv, panelBodyDiv);
    panel.prev = lastPanel;

    if (lastPanel) lastPanel.next = panel;
    lastPanel = panel;

    panelBodyDiv.onwheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0)
        panel.nextLine();
      else if (e.deltaY < 0)
        panel.prevLine();
    };

    panelBodyDiv.setAttribute('tabindex', '0');
    panelBodyDiv.onkeydown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        panel.prev?.focus();
      }
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        panel.next?.focus();
      }
      else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        changeNavButtons();
      }
      else if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        changeEase();
      }
      else if (e.key === ' ') {
        e.preventDefault();
        panel.nextLine();
      }
      else if (e.key === 'ArrowUp') {
        if (panel.hasLines()) {
          e.preventDefault();
          panel.prevLine();
        }
      }
      else if (e.key === 'ArrowDown') {
        if (panel.hasLines()) {
          e.preventDefault();
          panel.nextLine();
        }
      }
    };
  }

  let firstPanel = lastPanel!;
  while (firstPanel.prev) firstPanel = firstPanel.prev;

  for (let panel: Panel = firstPanel; panel; panel = panel.next!) {
    if (panel.prev) panel.panelDiv.append(<PageChanger to={panel.prev} side='left' ><LeftArrow /></PageChanger>);
    if (panel.next) panel.panelDiv.append(<PageChanger to={panel.next} side='right'><RightArrow /></PageChanger>);
  }

  const tab: Tab = new Tab(firstPanel, tabButtons.shift()!);
  Tab.tabs.push(tab);

  for (let panel: Panel = firstPanel; panel; panel = panel.next!) {
    panel.tab = tab;
  }
}

function PageChanger(attrs: { to: Panel, side: 'left' | 'right' }, children: any) {
  const button = (
    <button class={`page-changer side-${attrs.side}`} style={`${attrs.side}: 1px;`}>
      {children}
    </button>
  ) as HTMLButtonElement;
  button.onclick = (e) => {
    e.preventDefault();
    attrs.to.focus();
  };
  return button;
}

Tab.tabs[0]!.focus();


const enum Button {
  A, B, X, Y,
  L, R, ZL, ZR,
  MINUS, PLUS,
  LTRIGGER, RTRIGGER,
  UP, DOWN, LEFT, RIGHT,
  HOME,
}

const gamepad = () => navigator.getGamepads().find(c => c)!;

function handleController() {
  if (pressed(Button.L)) {
    const i = Math.max(Tab.currentTabIndex - 1, 0);
    Tab.tabs[i]?.focus();
  }
  else if (pressed(Button.R)) {
    const i = Math.min(Tab.currentTabIndex + 1, Tab.tabs.length - 1);
    Tab.tabs[i]?.focus();
  }

  if (pressed(Button.A)) {
    changeEase();
  }

  if (pressed(Button.B)) {
    changeNavButtons();
  }

  if (pressed(Button.RIGHT)) {
    Tab.currentTab.currentPanel.next?.focus();
  }
  else if (pressed(Button.LEFT)) {
    Tab.currentTab.currentPanel.prev?.focus();
  }

  if (pressed(Button.DOWN)) {
    Tab.currentTab.currentPanel.nextLine();
  }
  else if (pressed(Button.UP)) {
    Tab.currentTab.currentPanel.prevLine();
  }
}

const pressMap = new Map<number, number>();

function pressed(button: number) {
  if (!gamepad().buttons[button]!.pressed) return false;

  const lastPressed = pressMap.get(button) ?? 0;
  const now = Date.now();

  if (now > lastPressed + 300) {
    pressMap.set(button, now);
    return true;
  }

  return false;
}

let interval: NodeJS.Timeout | undefined;
window.addEventListener('gamepadconnected', (e) => { interval ??= setInterval(handleController, 33); });
window.addEventListener('gamepaddisconnected', (e) => { clearInterval(interval); interval = undefined; });
