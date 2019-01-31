import { createStore } from 'redux'

export const initialState = {
    productionHall: {
        color: '#faebd7',
        width: 1000,
        height: 350
    },
    workplaces: [
        { id: 1, title: 'wp1', color: '#e5c8e7', width: 200, height: 100, y: 200 },
        { id: 2, title: 'wp2', color: '#309EFF' },
        { id: 3, title: 'wp3', color: '#FFCF60', x: 300 },
        { id: 4, title: 'wp4', color: '#46ccac', x: 500 }
    ],
    selectedWorkplace: null
}

export const svgLayoutsApp = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_WORKPLACE':
            return Object.assign({}, state, {
                workplaces: [...state.workplaces, {
                    id: action.id, title: action.title, color: action.color,
                    height: action.height, width: action.width
                }]
            })
        case 'REMOVE_WORKPLACE':
            return Object.assign({}, state, {
                workplaces: state.workplaces.filter(o => o.id !== action.id)
            })
        case 'UPDATE_WORKPLACE':
            //console.log('UPDATE_WORKPLACE', action)
            return Object.assign({}, state, {
                workplaces: state.workplaces.map(workplace =>
                    (workplace.id === action.id)
                        ? { ...workplace, ...action.data }
                        : workplace
                )
            })
        case 'SELECT_WORKPLACE':
            return { ...state, selectedWorkplace: action.id };
        case 'UPDATE_SVG_POSITION':
            return Object.assign({}, state, {
                workplaces: state.workplaces.map(workplace =>
                    (workplace.id === action.id)
                        ? { ...workplace, x: action.x, y: action.y }
                        : workplace
                )
            })
        default:
            return state
    }
}

export const store = createStore(svgLayoutsApp)