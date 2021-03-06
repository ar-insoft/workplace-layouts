import { drawSvg } from '../util/draw'
import 'svg.draggy.js'
import { generateRandomString } from '../util/utils'
import { selection } from '../util/selection'
import throttle from 'lodash/throttle'
import { updateWorkplace, removeWorkplace } from '../actions'
import { store } from '../configureStore'
import { workplaceRepository } from './workplaceRepository'
import difference from 'lodash/difference';

export default class Workplace {
    constructor(options) {
        this.id = generateRandomString();
        Object.assign(this, options);

        this.handleDetectCollisionThrottled = throttle(this.handleDetectCollision, 100);
    }

    handleDragStart() {
        //console.log('startdrag');
        this.svg.front();
        this.startX = this.svg.x();
        this.startY = this.svg.y();
    }

    handleDragMove() {
        //console.log('drag');
        this.handleDetectCollisionThrottled();
    }

    handleDragEnd() {
        //console.log('dragend');
        if (this.isColliding) {
            this.svg.move(this.startX, this.startY);
            this.svg.removeClass('colliding');
        }

        if (this.hasMoved()) {
            store.dispatch(updateWorkplace({ id: this.id, x: this.svg.x(), y: this.svg.y() }));
        }
    }

    handleDelete() {
        store.dispatch(removeWorkplace(this.id));
    }

    handleDetectCollision() {
        let collisions = workplaceRepository.findCollisionsWith(this);
        //let isCollidingWithHall = !!(productionHall && productionHall.isCollidingWith(this));
        //console.log('isCollidingWithHall', isCollidingWithHall);

        let isColliding = collisions.length > 0; // || isCollidingWithHall;
        this.isColliding = isColliding;
        if (isColliding) {
            this.svg.addClass('colliding');
        } else {
            this.svg.removeClass('colliding');
            //this.startX = this.svg.x();
            //this.startY = this.svg.y();
        }

        //console.log('isColliding', isColliding, 'collisions', collisions);
    }

    hasMoved() {
        return this.startX !== this.svg.x() || this.startY !== this.svg.y();
    }

    getSvgForCollisionCalculation() {
        return this.rectBbox;
    }

    drawSvg = () => {
        let group = drawSvg.group();

        this.rectBbox = group.rect(this.width, this.height)
            .toPath(true)
            .fill(this.color)
            .stroke({ color: this.color, width: 2 })
            .addClass('workplaceBBox')

        group.on('dragstart', evt => this.handleDragStart(evt));
        group.on('dragmove', evt => this.handleDragMove(evt));
        group.on('dragend', evt => this.handleDragEnd(evt));

        selection.addSelectable(group, this);

        if (this.imgPath) {
            let image = group.image(process.env.PUBLIC_URL + this.imgPath)
                .loaded(loader => image.size(loader.width * 0.35))
                .dmove(5, 5);
        }

        if (this.title) {
            group.plain(this.title).font('family', '').addClass('workplaceTitle').dmove(0, this.height + 15);
        }

        group.move(this.x, this.y)
            .data('workplace-id', this.id)
            .draggy()

        this.svg = group;
        return this;
    }

    setter = (changes) => {
        Object.assign(this, changes);
        return this
    }
}

export const handleWorkplacesStateChange = (current, prev = []) => {
    const prevIds = prev.map(o => o.id);
    const currentIds = current.map(o => o.id);
    const deleted = difference(prevIds, currentIds);
    const added = difference(currentIds, prevIds);

    // console.log('deleted', deleted);
    // console.log('added', added);

    added.forEach(id => {
        let workplaceData = current.find(o => o.id === id);
        workplaceRepository.add(new Workplace(workplaceData).drawSvg());
    });

    deleted.forEach(id => {
        workplaceRepository.findById(id).svg.remove();
        workplaceRepository.remove({ id });
    });

    //console.log('workplaceRepository list', workplaceRepository.list());
}

export const handleWorkplaceSelectionStateChange = (toId, fromId) => {
    //console.log('handleWorkplaceSelectionStateChange from ', fromId, 'to', toId)
    let selectedWorkplaceObj = workplaceRepository.findById(toId);
    if (selectedWorkplaceObj) {
       selection.current = selectedWorkplaceObj.svg.node;
    }
}