import { drawSvg } from '../util/draw'
//import { isPathColliding } from '../util/collisions'
import 'svg.draggy.js'
import { generateRandomString } from '../util/utils'
import { productionHall } from '../ProductionHall'
import { selection } from '../util/selection'
import throttle from 'lodash/throttle'

const defaults = {
    title: 'untitled workplace',
    color: '#FFCF60',
    width: 100,
    height: 100,
    x: 0,
    y: 0
}

export default class Workplace {

    constructor(options) {
        this.id = generateRandomString();
        Object.assign(this, defaults, options);
        //console.log(this);
        this.handleDetectCollisionThrottled = throttle(this.handleDetectCollision, 100);
    }

    handleDragStart() {
        console.log('startdrag');
        this.startX = this.svg.x();
        this.startY = this.svg.y();
    }

    handleDragMove() {
        // console.log('drag');
        this.handleDetectCollisionThrottled();
    }

    handleDragEnd() {
        console.log('dragend', 'isColliding');
        if (this.isColliding) {
            this.svg.move(this.startX, this.startY);
            this.svg.removeClass('colliding');
        }
    }

    handleDelete() {
        console.log('handleDelete', this);
        productionHall.removeWorkplace(this);
        console.log('workplaces on productionHall', productionHall.workplaces);
    }

    handleDetectCollision() {
        let collisions = productionHall.findCollisionsWith(this);

        let isColliding = collisions.length > 0;
        this.isColliding = isColliding;
        if (isColliding) {
            this.svg.addClass('colliding');
        } else {
            this.svg.removeClass('colliding');
            this.startX = this.svg.x();
            this.startY = this.svg.y();
        }

        console.log('isColliding', isColliding, 'collisions', collisions);
    }

    render = () => {
        this.svg = drawSvg.rect(this.width, this.height)
            .move(this.x, this.y)
            .toPath(true)
            .fill(this.color)
            .stroke({ color: this.color, width: 2 })
            .draggy(); //productionHall.minMaxBounds

        this.svg.on("dragstart", evt => this.handleDragStart(evt));
        this.svg.on("dragmove", evt => this.handleDragMove(evt));
        this.svg.on("dragend", evt => this.handleDragEnd(evt));

        selection.addSelectable(this);
    }

    setter = (changes) => {
        Object.assign(this, changes);
        return this
    }
}