import { Component, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList } from "@angular/core";
import { screen } from 'platform';
import { GridLayout } from "ui/layouts/grid-layout";
import { PanGestureEventData, GestureStateTypes, GestureEventData } from "ui/gestures";
import { AnimationCurve } from "ui/enums";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent implements AfterViewInit {

    @ViewChild('centerCircle', { static: true }) centerCircle: ElementRef;
    @ViewChild('dragCircle', { static: true }) dragCircle: ElementRef;
    @ViewChild('leftTabs', { static: true }) leftTabs: ElementRef;
    @ViewChild('rightTabs', { static: true }) rightTabs: ElementRef;
    @ViewChild('centerPatch', { static: true }) centerPatch: ElementRef;
    @ViewChild('tabBGContainer', { static: true }) tabBGContainer: ElementRef;

    @ViewChildren('tabContents', { read: ElementRef }) tabContents: QueryList<ElementRef>;

    //animationCurve = AnimationCurve.cubicBezier(1, .02, .45, .93);
    animationCurve = AnimationCurve.cubicBezier(.17, .67, .83, .67);

    // colors
    // pink: #C9449D
    // orange: #E6A938
    // blue: #4195AA
    // purple: #5B37B7

    tabContainer = {
        backgroundColor: '#fff',
        focusColor: '#fff'
    };
    tabList: { text: string, icon?: string, color?: string, backgroundColor: string, fadeColor?: string }[] = [
        { text: 'A', backgroundColor: '#5B37B7', color: '#000' },
        { text: 'B', backgroundColor: '#E6A938', color: '#000' },
        { text: 'C', backgroundColor: '#C9449D', color: '#000' },
        { text: 'D', backgroundColor: '#4195AA', color: '#000' },
        { text: 'E', backgroundColor: '#4195AA', color: '#000' }
    ];

    currentTabIndex: number = 0;
    defaultSelected: number = 2;

    constructor() {
    }

    ngAfterViewInit(): void {
        this.leftTabs.nativeElement.width = screen.mainScreen.widthDIPs;
        this.rightTabs.nativeElement.width = screen.mainScreen.widthDIPs;
        this.centerPatch.nativeElement.width = 100;

        this.tabBGContainer.nativeElement.translateX = - (screen.mainScreen.widthDIPs / 2) - (80 / 2);

        const tabContentsArr = this.tabContents.toArray();
        tabContentsArr[this.defaultSelected].nativeElement.scaleX = 1.5;
        tabContentsArr[this.defaultSelected].nativeElement.scaleY = 1.5;
        tabContentsArr[this.defaultSelected].nativeElement.translateY = - 15;
        this.currentTabIndex = this.defaultSelected;
    }

    onBottomNavTap(index: number, duration?: number): void {
        if (this.currentTabIndex !== index) {
            const tabContentsArr = this.tabContents.toArray();
            tabContentsArr[this.currentTabIndex].nativeElement.animate({
                scale: { x: 1, y: 1 },
                translate: { x: 0, y: 0 },
                duration: duration ? duration : 100
            });

            tabContentsArr[index].nativeElement.animate({
                scale: { x: 1.5, y: 1.5 },
                translate: { x: 0, y: -15 },
                duration: duration ? duration : 100
            });
        }

            // TODO: refactor this so code can be reused
            this.centerCircle.nativeElement.animate({
                translate: { x: this.getTabTranslateX(index), y: 0 },
                curve: this.animationCurve,
                duration: duration ? duration : 100
            });
            this.leftTabs.nativeElement.animate({
                translate: { x: this.getTabTranslateX(index), y: 0 },
                curve: this.animationCurve,
                duration: duration ? duration : 100
            });
            this.rightTabs.nativeElement.animate({
                translate: { x: this.getTabTranslateX(index), y: 0 },
                curve: this.animationCurve,
                duration: duration ? duration : 100
            });
            this.centerPatch.nativeElement.animate({
                translate: { x: this.getTabTranslateX(index), y: 0 },
                curve: this.animationCurve,
                duration: duration ? duration : 100
            });

            this.dragCircle.nativeElement.animate({
                translate: { x: this.getTabTranslateX(index), y: 0 },
                curve: this.animationCurve,
                duration: duration ? duration : 100
            });

            this.currentTabIndex = index;
    }

    prevDeltaX: number = 0;
    onCenterCirclePan(args: PanGestureEventData): void {
        let stkLayout: GridLayout = <GridLayout>args.object;
        let newX: number = stkLayout.translateX + args.deltaX - this.prevDeltaX;

        if (args.state === 0) {
            // finger down
            this.prevDeltaX = 0;
        }
        else if (args.state === 2) {
            // finger moving
            stkLayout.translateX = newX;
            this.leftTabs.nativeElement.translateX = newX;
            this.rightTabs.nativeElement.translateX = newX;
            this.centerPatch.nativeElement.translateX = newX;
            this.centerCircle.nativeElement.translateX = newX;

            this.prevDeltaX = args.deltaX;
        }
        else if (args.state === 3) {
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

    getTabTranslateX(index: number): number {
        return index * screen.mainScreen.widthDIPs / this.tabList.length - (screen.mainScreen.widthDIPs / 2) + (80 / 2)
    }
}
