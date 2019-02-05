import SVG from 'svg.js'
import { drawSvg } from '../util/draw'
import { isRectColliding } from '../util/collisions'
import { generateRandomString } from '../util/utils'
import Workplace from '../workplace/Workplace'
import { selection } from '../util/selection'
import { store, observeStore } from '../reducers'
import * as actions from '../actions'

class ProductionHall {
    constructor(options = {}) {
        this.id = generateRandomString();

        Object.assign(this, options);

        this.workplaces = store.getState().workplaces.map(o => new Workplace(o));
    }

    // addWorkplace(...workplaces) {
    //     let existing = this.workplaces.map(o => o.id);
    //     workplaces.forEach(workplace => {
    //         if (!existing.includes(workplace.id)) {
    //             this.workplaces.push(workplace);
    //         }
    //     })
    //     return this;
    // }

    removeWorkplace(workplace) {
        this.workplaces = this.workplaces.filter(o => o.id !== workplace.id);
        store.dispatch(actions.removeWorkplace(workplace.id));
        workplace.svg.remove();
        return this;
    }

    findWorkplacesOtherThan(workplace) {
        return this.workplaces.filter(o => o.id !== workplace.id);
    }

    findCollisionsWith(obj) {
        let collidingWorkplaces = this.findWorkplacesOtherThan(obj)
            .filter(o => isRectColliding(o.svg, obj.svg));

        return collidingWorkplaces;
    }

    findWorkplaceById(id) {
        if (!id) {
            return null;
        }
        return this.workplaces.find(o => o.id === id);
    }

    get minMaxBounds() {
        let bbox = this.svg.bbox();
        return { minX: bbox.x, minY: bbox.y, maxX: bbox.w, maxY: bbox.h }
    }

    render = (points) => {
        this.svg = drawSvg.polygon(points).toPath(true).addClass('productionHall').back();
        this.workplaces.forEach(wp => wp.render());

        const handleWorkplaceSelectionChange = (id) => {
            let selectedWorkplaceObj = this.findWorkplaceById(id);
            if (selectedWorkplaceObj) {
                selection.current = selectedWorkplaceObj.svg.node;
            }
        }

        observeStore(store, (state) => state.selectedWorkplace, (state) => handleWorkplaceSelectionChange(state));
    }
}

SVG.on(document, 'DOMContentLoaded', () => {
    if (store.getState().productionHall) {
        console.log('init productionHall from state', store.getState().productionHall);
        productionHall = new ProductionHall(store.getState().productionHall);
        productionHall.render(store.getState().productionHall.points);
    }

    observeStore(store, (state) => state.productionHall, (newState) => {
        console.log('changedProductionHallState', newState);
        console.log('productionHall', productionHall);

        if (!productionHall && newState) {
            productionHall = new ProductionHall(newState);
            console.log('new productionHall', productionHall);


            if (newState.points) {
                console.log('render with points', newState);
                productionHall.render(newState.points);
            }
        }
    });
});

export let productionHall = null;