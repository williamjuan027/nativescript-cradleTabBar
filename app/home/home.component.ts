import { Component, ViewChild, ElementRef, ViewChildren, QueryList } from "@angular/core";
import { isAndroid, screen } from "tns-core-modules/platform";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import { PanGestureEventData, GestureStateTypes, GestureEventData } from "tns-core-modules/ui/gestures";
import { AnimationCurve } from "tns-core-modules/ui/enums";
import { SelectedIndexChangedEventData } from "tns-core-modules/ui/tab-view";

@Component({
  selector: "Home",
  moduleId: module.id,
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent {

  @ViewChild('tabs', { static: true }) tabs: ElementRef;
  @ViewChild('centerCircle', { static: true }) centerCircle: ElementRef;
  @ViewChild('dragCircle', { static: true }) dragCircle: ElementRef;
  @ViewChild('leftTabs', { static: true }) leftTabs: ElementRef;
  @ViewChild('rightTabs', { static: true }) rightTabs: ElementRef;
  @ViewChild('centerPatch', { static: true }) centerPatch: ElementRef;
  @ViewChild('tabBGContainer', { static: true }) tabBGContainer: ElementRef;

  @ViewChildren('tabContents', { read: ElementRef }) tabContents: QueryList<ElementRef>;

  // Tab Contents and Properties
  defaultSelected: number = 2;
  tabContainer = {
    backgroundColor: '#fff',
    focusColor: '#fff'
  };
  tabList: { text: string, icon?: string, color?: string, backgroundColor: string, fadeColor?: string }[] = [
    { text: String.fromCharCode(0xf080), backgroundColor: '#5B37B7', color: '#000' },
    { text: String.fromCharCode(0xf075), backgroundColor: '#E6A938', color: '#000' },
    { text: String.fromCharCode(0xf259), backgroundColor: '#C9449D', color: '#000' },
    { text: String.fromCharCode(0xf1d8), backgroundColor: '#4195AA', color: '#000' },
    { text: String.fromCharCode(0xf073), backgroundColor: '#4A9F6E', color: '#000' }
  ];


  // Tab Helper
  isAndroid = isAndroid;
  private prevDeltaX: number = 0;
  private animationCurve = AnimationCurve.cubicBezier(.38, .47, 0, 1);
  private androidTargetTabIndex: number = this.defaultSelected;

  constructor() { }

  // --------------------------------------------------------------------
  // User Interaction

  onSelectedIndexChanged(args: SelectedIndexChangedEventData): void {
    if (isAndroid && args.newIndex !== this.androidTargetTabIndex) {
      // NOTE: this is a workaround for android firing this event multiple times,
      // and stopping on the wrong tab
      // TODO: fix this
      setTimeout(() => {
        this.tabs.nativeElement.selectedIndex = this.androidTargetTabIndex;
      })
    }
    // TODO: unocmment this if swipeEnabled
    // Figure out a way to differentiate between selected index is fired
    // from swipe event or from setting index programmatically
    // if (args.newIndex !== this.currentTabIndex) {
    //     this.onBottomNavTap(args.newIndex);
    // }
  }

  // Tap on a one of the tabs
  onBottomNavTap(index: number, duration: number = 300): void {
    if (index < 0) {
      return;
    }
    const currentIndex = this.tabs.nativeElement.selectedIndex;
    if (currentIndex !== index) {
      const tabContentsArr = this.tabContents.toArray();

      // set unfocus to previous index
      tabContentsArr[currentIndex].nativeElement.animate(this.getUnfocusAnimation(currentIndex, duration)).catch(e => { });

      // set focus to current index
      tabContentsArr[index].nativeElement.animate(this.getFocusAnimation(index, duration)).catch(e => { });

      // set current index to new index
      this.androidTargetTabIndex = index;
      this.tabs.nativeElement.selectedIndex = index;
    }
    this.centerCircle.nativeElement.backgroundColor = this.tabList[index].backgroundColor;
    this.centerCircle.nativeElement.animate(this.getSlideAnimation(index, duration)).catch(e => { });
    this.leftTabs.nativeElement.animate(this.getSlideAnimation(index, duration)).catch(e => { });
    this.rightTabs.nativeElement.animate(this.getSlideAnimation(index, duration)).catch(e => { });
    this.centerPatch.nativeElement.animate(this.getSlideAnimation(index, duration)).catch(e => { });
    this.dragCircle.nativeElement.animate(this.getSlideAnimation(index, duration)).catch(e => { });
  }

  // Drag the focus circle to one of the tabs
  onCenterCirclePan(args: PanGestureEventData): void {
    let grdLayout: GridLayout = <GridLayout>args.object;
    let newX: number = grdLayout.translateX + args.deltaX - this.prevDeltaX;

    if (args.state === 0) {
      // finger down
      this.prevDeltaX = 0;
    } else if (args.state === 2) {
      // finger moving
      grdLayout.translateX = newX;
      this.leftTabs.nativeElement.translateX = newX;
      this.rightTabs.nativeElement.translateX = newX;
      this.centerPatch.nativeElement.translateX = newX;
      this.centerCircle.nativeElement.translateX = newX;

      this.prevDeltaX = args.deltaX;
    } else if (args.state === 3) {
      // finger up
      this.prevDeltaX = 0;
      const tabWidth = screen.mainScreen.widthDIPs / this.tabList.length;
      const tabSelected: number = Math.round(Math.abs(newX / tabWidth));
      const translateX: number = tabSelected * tabWidth;
      if (newX < 0) {
        // pan left
        this.onBottomNavTap(this.defaultSelected - tabSelected, 50);
      } else {
        // pan right
        this.onBottomNavTap(this.defaultSelected + tabSelected, 50);
      }
    }
  }

  // --------------------------------------------------------------------
  // Tab bar helpers

    onTabsLoaded(args): void {
      if (args.object.ios) {
        args.object.ios.tabBar.hidden = true;
      }
    }

  ontabContentsLoaded(args): void {
    // set up base layer
    this.leftTabs.nativeElement.width = screen.mainScreen.widthDIPs;
    this.rightTabs.nativeElement.width = screen.mainScreen.widthDIPs;
    this.centerPatch.nativeElement.width = 100;

    this.tabBGContainer.nativeElement.translateX = - (screen.mainScreen.widthDIPs / 2) - (80 / 2);

    // set default selected tab
    this.centerCircle.nativeElement.backgroundColor = this.tabList[this.defaultSelected].backgroundColor;
    const tabContentsArr = this.tabContents.toArray();
    tabContentsArr[this.defaultSelected].nativeElement.scaleX = 1.5;
    tabContentsArr[this.defaultSelected].nativeElement.scaleY = 1.5;
    tabContentsArr[this.defaultSelected].nativeElement.translateY = - 15;
    this.tabs.nativeElement.selectedIndex = this.defaultSelected;
  }

  getSlideAnimation(index: number, duration: number) {
    return {
      translate: { x: this.getTabTranslateX(index), y: 0 },
      curve: this.animationCurve,
      duration: duration
    };
  }

  getFocusAnimation(index: number, duration: number) {
    return {
      scale: { x: 1.5, y: 1.5 },
      translate: { x: 0, y: -15 },
      duration: duration
    };
  }

  getUnfocusAnimation(index: number, duration: number) {
    return {
      scale: { x: 1, y: 1 },
      translate: { x: 0, y: 0 },
      duration: duration
    };
  }

  getTabTranslateX(index: number): number {
    return index * screen.mainScreen.widthDIPs / this.tabList.length - (screen.mainScreen.widthDIPs / 2) + (80 / 2);
  }
}
