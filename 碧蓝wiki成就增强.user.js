// ==UserScript==
// @name        碧蓝 wiki 大型作战成就记录地图增强
// @namespace   http://github.com/8qwe24657913
// @match       https://wiki.biligame.com/blhx/%E5%A4%A7%E5%9E%8B%E4%BD%9C%E6%88%98%E6%88%90%E5%B0%B1%E8%AE%B0%E5%BD%95%E5%9C%B0%E5%9B%BE
// @grant       none
// @run-at      document-start
// @version     1.0
// @author      8q
// @description 增加侵蚀度、成就奖励、海域id、海域名称筛选器，添加存/读档功能，禁用导致存档混乱的网络同步（只存不读，如果之后修好了就再启用同步），避免弹出框偏移出地图，去除平移与缩放
// ==/UserScript==

/* globals L mapData mapModel filterSection filterMouseover filterMouseout mapPoints filterClick updateSection mapSize updateMap saveAchievements */
;(function () {
    'use strict'
    function patch() {
        const LEVEL_COUNT = 6
        const ALL_REWARDS = [
            '深渊6',
            '深渊5',
            '深渊4',
            '宝箱6',
            '金菜',
            '紫菜',
            '金猫箱',
            '魔方',
            '紫币',
            '物资',
            '指令书',
        ]
        const MAP_DATA_SUPPLEMENT = {
            11: [6, '指令书', '金菜', '魔方', '深渊6', '金猫箱'],
            12: [5, '指令书', '物资', '魔方', '紫币', '金猫箱'],
            13: [5, '指令书', '金菜', '魔方', '紫币', '金猫箱'],
            14: [4, '紫币', '物资', '金菜', '紫币', '魔方'],
            21: [2, '紫币', '物资', '紫菜', '紫币', '金菜'],
            22: [1, '紫币', '指令书', '紫菜', '紫币', '物资'],
            23: [2, '指令书', '紫菜', '紫菜', '紫币', '金菜'],
            24: [2, '指令书', '紫菜', '物资', '紫币', '物资'],
            25: [3, '指令书', '紫菜', '金菜', '紫币', '金菜'],
            31: [2, '紫币', '紫菜', '紫菜', '紫币', '物资'],
            32: [3, '指令书', '紫菜', '金菜', '宝箱6', '金菜'],
            33: [3, '指令书', '紫菜', '物资', '宝箱6', '金菜'],
            34: [3, '指令书', '紫菜', '紫菜', '宝箱6', '魔方'],
            41: [3, '指令书', '物资', '金菜', '紫币', '魔方'],
            42: [4, '指令书', '物资', '金菜', '紫币', '魔方'],
            43: [2, '紫币', '紫菜', '物资', '紫币', '物资'],
            44: [1, '紫币', '指令书', '紫菜', '紫币', '物资'],
            51: [4, '指令书', '物资', '魔方', '深渊4', '魔方'],
            52: [4, '紫币', '金菜', '魔方', '紫币', '魔方'],
            53: [4, '指令书', '金菜', '魔方', '紫币', '魔方'],
            54: [4, '指令书', '金菜', '金菜', '深渊4', '魔方'],
            61: [4, '指令书', '物资', '魔方', '深渊4', '魔方'],
            62: [3, '指令书', '物资', '金菜', '宝箱6', '紫菜'],
            63: [4, '指令书', '物资', '金菜', '紫币', '魔方'],
            64: [4, '指令书', '金菜', '金菜', '深渊4', '魔方'],
            65: [3, '指令书', '指令书', '金菜', '紫币', '魔方'],
            66: [3, '指令书', '指令书', '物资', '紫币', '魔方'],
            71: [5, '指令书', '金菜', '魔方', '深渊5', '金猫箱'],
            72: [6, '指令书', '金菜', '魔方', '深渊6', '金猫箱'],
            73: [5, '指令书', '金菜', '魔方', '深渊5', '金猫箱'],
            81: [2, '指令书', '指令书', '物资', '紫币', '金菜'],
            82: [4, '紫币', '金菜', '魔方', '深渊4', '魔方'],
            83: [2, '指令书', '物资', '物资', '紫币', '金菜'],
            84: [2, '紫币', '紫菜', '物资', '紫币', '金菜'],
            85: [4, '指令书', '金菜', '魔方', '深渊4', '魔方'],
            91: [4, '指令书', '金菜', '魔方', '深渊4', '魔方'],
            92: [2, '紫币', '指令书', '紫菜', '紫币', '物资'],
            93: [2, '指令书', '指令书', '紫菜', '紫币', '物资'],
            94: [3, '指令书', '指令书', '物资', '宝箱6', '紫菜'],
            95: [3, '指令书', '金菜', '紫菜', '宝箱6', '紫菜'],
            101: [5, '指令书', '物资', '魔方', '深渊5', '金猫箱'],
            102: [5, '指令书', '物资', '魔方', '深渊5', '金猫箱'],
            103: [4, '紫币', '金菜', '魔方', '深渊4', '魔方'],
            104: [4, '紫币', '金菜', '魔方', '深渊4', '魔方'],
            105: [3, '紫币', '指令书', '紫菜', '宝箱6', '魔方'],
            106: [6, '指令书', '金菜', '魔方', '深渊6', '金猫箱'],
            111: [3, '紫币', '指令书', '金菜', '紫币', '魔方'],
            112: [2, '指令书', '指令书', '紫菜', '紫币', '物资'],
            113: [3, '紫币', '指令书', '金菜', '紫币', '魔方'],
            114: [3, '紫币', '指令书', '物资', '宝箱6', '物资'],
            121: [6, '指令书', '金菜', '魔方', '深渊6', '金猫箱'],
            122: [2, '指令书', '物资', '紫菜', '紫币', '物资'],
            123: [3, '紫币', '金菜', '紫菜', '紫币', '物资'],
            124: [5, '指令书', '物资', '魔方', '紫币', '金猫箱'],
            125: [3, '紫币', '指令书', '紫菜', '紫币', '物资'],
            131: [2, '指令书', '指令书', '紫菜', '紫币', '物资'],
            132: [2, '指令书', '物资', '紫菜', '紫币', '物资'],
            133: [3, '紫币', '金菜', '金菜', '紫币', '物资'],
            134: [2, '指令书', '物资', '紫菜', '紫币', '物资'],
            135: [3, '紫币', '金菜', '物资', '宝箱6', '魔方'],
            141: [3, '紫币', '指令书', '金菜', '紫币', '魔方'],
            142: [4, '紫币', '金菜', '魔方', '深渊4', '魔方'],
            143: [3, '紫币', '指令书', '金菜', '宝箱6', '魔方'],
            144: [5, '指令书', '金菜', '魔方', '紫币', '金猫箱'],
            151: [5, '指令书', '金菜', '魔方', '深渊5', '金猫箱'],
            152: [5, '指令书', '金菜', '魔方', '紫币', '金猫箱'],
            153: [6, '指令书', '金菜', '魔方', '深渊6', '金猫箱'],
            155: [6, '指令书', '金菜', '魔方', '深渊6', '金猫箱'],
            156: [6, '指令书', '金菜', '魔方', '深渊6', '金猫箱'],
            157: [6, '指令书', '金菜', '魔方', '深渊6', '金猫箱'],
            158: [5, '指令书', '物资', '魔方', '紫币', '金猫箱'],
            159: [5, '指令书', '物资', '魔方', '深渊5', '金猫箱'],
        }
        const name2id = {}
        const name2level = {}
        const name2rewards = {}
        for (const [id, [level, ...rewards]] of Object.entries(MAP_DATA_SUPPLEMENT)) {
            if (!mapData[id]) continue
            const name = mapData[id][0]
            name2id[name] = Number(id)
            name2level[name] = level
            name2rewards[name] = rewards
        }
        // 原来就有的 bug，更新了成就情况后筛选结果不跟着变
        const oldUpdateMap = updateMap
        window.updateMap = function updateMap() {
            oldUpdateMap()
            updateSection()
        }
        // 增加各种筛选器
        const safetyFilterList = L.DomUtil.get('filter-safe-todo-box').parentElement
        function createFilterList(type, text) {
            L.DomUtil.create(
                'div',
                `filter-title filter-${type}-title`,
                safetyFilterList.parentElement,
            ).innerText = text
            return L.DomUtil.create('div', `filter-list filter-${type}-list`, safetyFilterList.parentElement)
        }
        const levelFilterList = createFilterList('level', '侵蚀度：')
        const rewardFilterList = createFilterList('reward', '未获取的奖励：')
        const nameIdFilterList = createFilterList('name-id', '海域搜索：')
        function createFilterBox(parent, type, text, i) {
            const filterBox = L.DomUtil.create('label', null, parent)
            filterBox.id = `filter-${type}-${i + 1}-box`
            filterBox.for = `filter-${type}-${i + 1}`
            filterBox.innerHTML = `<div><input type="checkbox" id="filter-${type}-${
                i + 1
            }" class="leaflet-control-layers-selector"><span>${text}</span></div>`
            return L.DomUtil.get(`filter-${type}-${i + 1}`)
        }
        const levelFilterBoxes = new Array(LEVEL_COUNT)
            .fill()
            .map((_, i) => createFilterBox(levelFilterList, 'level', `侵蚀${i + 1}`, i))
        const rewardFilterBoxes = ALL_REWARDS.map((reward, i) => createFilterBox(rewardFilterList, 'reward', reward, i))
        const nameIdFilterBoxes = [
            ['name', '海域名称：', null],
            ['id', '海域编号：', '^\\d+$'],
        ].map(([type, text, pattern]) => {
            const filterBox = L.DomUtil.create('label', null, nameIdFilterList)
            filterBox.id = `filter-${type}-box`
            filterBox.for = `filter-${type}`
            filterBox.innerText = text
            const filterInput = L.DomUtil.create('input', 'leaflet-control-layers-selector', filterBox)
            filterInput.type = 'text'
            filterInput.id = `filter-${type}`
            filterInput.pattern = pattern
            return filterInput
        })
        const safetyFilter = filterSection
        const filters = {
            safety: {
                checked: false,
                filter: safetyFilter,
                update() {
                    mapModel.filters.safeTodo = L.DomUtil.get('filter-safe-todo').checked
                    mapModel.filters.normalTodo = L.DomUtil.get('filter-normal-todo').checked
                    this.checked = mapModel.filters.safeTodo || mapModel.filters.normalTodo
                },
            },
            level: {
                checked: false,
                filter(section) {
                    return mapModel.filters.levels[name2level[section.name] - 1]
                },
                update() {
                    mapModel.filters.levels = levelFilterBoxes.map((checkbox) => checkbox.checked)
                    this.checked = mapModel.filters.levels.includes(true)
                },
            },
            reward: {
                checked: false,
                filter(section) {
                    const rewards = name2rewards[section.name].slice(section.completed.filter((x) => x).length)
                    return rewards.some((reward) => mapModel.filters.rewards.has(reward))
                },
                update() {
                    mapModel.filters.rewards = new Set(
                        rewardFilterBoxes.map((checkbox, i) => checkbox.checked && ALL_REWARDS[i]).filter((x) => x),
                    )
                    this.checked = mapModel.filters.rewards.size > 0
                },
            },
            name: {
                checked: false,
                filter(section) {
                    return section.name.includes(mapModel.filters.name)
                },
                update() {
                    mapModel.filters.name = nameIdFilterBoxes[0].value
                    this.checked = !!mapModel.filters.name
                },
            },
            id: {
                checked: false,
                filter(section) {
                    return name2id[section.name] === mapModel.filters.id
                },
                update() {
                    const value = nameIdFilterBoxes[1].value
                    mapModel.filters.id = Number(value)
                    this.checked = !!value && !Number.isNaN(mapModel.filters.id)
                },
            },
        }
        /**
         * 筛选规则：
         * 1. 同一筛选器的不同选项间为逻辑或关系，不同筛选器间为逻辑与关系
         * 2. 若用户未填写某个筛选器，则视为该筛选器不存在
         * 3. 不存在任何筛选器时，不选中任何区块
         */
        let hasFilter = false
        window.filterSection = function filterSection(section) {
            if (!hasFilter) return false
            for (const { filter, checked } of Object.values(filters)) {
                if (checked && !filter(section)) return false
            }
            return true
        }
        function filterChange() {
            hasFilter = false
            for (const filter of Object.values(filters)) {
                filter.update()
                hasFilter = hasFilter || filter.checked
            }
            updateSection()
        }
        filterChange()
        function newFilterMouseover(checkbox) {
            if (!checkbox.checked) {
                checkbox.checked = true
                filterChange()
                checkbox.checked = false
            }
        }
        L.DomEvent.off(safetyFilterList, 'click', filterClick)
        for (const box of safetyFilterList.children) {
            L.DomEvent.off(box, {
                mouseover: filterMouseover,
                mouseout: filterMouseout,
            })
        }
        for (const list of [safetyFilterList, levelFilterList, rewardFilterList]) {
            for (const box of list.children) {
                L.DomEvent.on(box, {
                    mouseover: newFilterMouseover.bind(null, L.DomUtil.get(box.id.slice(0, -4))),
                    mouseout: filterChange,
                    change: filterChange,
                })
            }
        }
        for (const box of nameIdFilterBoxes) {
            L.DomEvent.on(box, 'input paste change', filterChange)
        }
        // 备份 / 读取存档
        const collapseList = document.getElementsByClassName('leaflet-control-layers-overlays')[0].parentElement
        L.DomUtil.create('div', 'leaflet-control-layers-separator', collapseList)
        const saveLoadList = L.DomUtil.create('div', 'achievement-backup-load', collapseList)
        const saveLoad = [
            {
                type: 'backup',
                text: '备份',
                onclick() {
                    const achievementList = []
                    for (const i in mapModel.mapSection) {
                        const section = mapModel.mapSection[i]
                        for (const j in section.completed) {
                            if (section.completed[j]) {
                                achievementList.push(i + '-' + j)
                            }
                        }
                    }
                    const userAchievements = achievementList.join(',')
                    const blob = new Blob([userAchievements], {
                        type: 'text/plain',
                    })
                    const a = document.createElement('a')
                    a.href = URL.createObjectURL(blob)
                    a.download = `achievements-${new Date().toISOString()}.txt`
                    a.click()
                },
            },
            {
                type: 'load',
                text: '读档',
                onclick() {
                    const input = L.DomUtil.create('input')
                    input.type = 'file'
                    input.accept = '.txt,text/plain'
                    input.onchange = () => {
                        if (input.files.length === 0) return
                        const [file] = input.files
                        const fr = new FileReader()
                        fr.onload = () => {
                            updateAchievements(fr.result)
                            saveAchievements()
                        }
                        fr.readAsText(file)
                    }
                    input.click()
                },
            },
        ]
        for (const { type, text, onclick } of saveLoad) {
            const button = L.DomUtil.create('button', `achievement-${type}`, saveLoadList)
            button.innerText = text
            L.DomEvent.on(button, 'click', onclick)
        }
        // 修改 popup 位置，使其不会超出窗口外
        initRrose()
        for (const mapPoint of Object.values(mapPoints)) {
            const { marker, popup } = mapPoint
            marker.bindPopup(
                (mapPoint.popup = new L.Rrose({
                    ...popup.options,
                    autoPan: false,
                }).setContent(popup.getContent())),
            )
            popup.remove()
        }
        // 防止用户手快事先平移或缩放了，复位一下
        const map = mapPoints[11].marker._map
        map.fitBounds([[0, 0], mapSize])
        // 禁止平移和缩放
        map.boxZoom.disable()
        map.doubleClickZoom.disable()
        map.dragging.disable()
        map.keyboard.disable()
        map.scrollWheelZoom.disable()
        map.touchZoom.disable()
        map.zoomControl.remove()
        // 自定义样式
        document.head.appendChild(document.createElement('style')).appendChild(
            document.createTextNode(`
            /* 存/读档按钮 */
            .achievement-backup-load {
                display: flex;
                justify-content: space-around;
            }
            /* 防止用户选中奇怪的东西 */
            #alworldmap {
                user-select: none;
            }
            .leaflet-rrose-content, .achievement-count-text {
                user-select: text;
            }
            /* 能点的东西给个提示啊 */
            #alworldmap .achievement,
            #alworldmap label,
            #alworldmap input[type="checkbox"],
            #alworldmap input[type="radio"],
            .leaflet-rrose-close-button,
            .achievement-backup-load button {
                cursor: pointer;
            }
        `),
        )
    }
    // 实测 bwiki 上 media wiki api 存的东西有时会乱套（读到了别人的存档？），先把网络同步禁用掉
    function loadAchievements() {
        return localStorage.getItem('userjs-worldmap-achievements') || ''
    }
    function updateAchievements(achievements) {
        const updated = new Set()
        for (const achievement of achievements.split(',')) {
            const [i, j] = achievement.split('-')
            const { completed } = mapModel.mapSection[i]
            if (!updated.has(i)) {
                completed.fill(false)
                updated.add(i)
            }
            completed[j] = true
        }
        updateMap()
    }
    function replaceLoadAchievements() {
        window.loadAchievements = loadAchievements
    }
    if (typeof mapModel === 'undefined') {
        // 早于地图初始化
        Object.defineProperty(window, 'mapModel', {
            get() {
                return undefined
            },
            set(value) {
                Object.defineProperty(window, 'mapModel', {
                    value,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                })
                replaceLoadAchievements()
                // 等初始化完了再执行 patch
                queueMicrotask(patch)
            },
            enumerable: false,
            configurable: true,
        })
    } else {
        // 晚于地图初始化
        replaceLoadAchievements()
        // 执行时机晚则需要手动读取本地存档以更新地图
        updateAchievements(loadAchievements())
        patch()
    }
    // 下面是引用的库，用来调整弹出框位置
    function initRrose() {

        /*
  Copyright (c) 2012 Eric S. Theise
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
  persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
  Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

        L.Rrose = L.Popup.extend({
            _initLayout: function () {
                const prefix = 'leaflet-rrose'
                const container = (this._container = L.DomUtil.create(
                    'div',
                    prefix + ' ' + this.options.className + ' leaflet-zoom-animated',
                ))
                let closeButton
                let wrapper

                if (this.options.closeButton) {
                    closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container)
                    closeButton.href = '#close'
                    closeButton.innerHTML = '&#215;'

                    L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this)
                }

                // Set the pixel distances from the map edges at which popups are too close and need to be re-oriented.
                const xBound = 200
                const yBound = 200
                // Determine the alternate direction to pop up; north mimics Leaflet's default behavior, so we initialize to that.
                this.options.position = 'n'
                // Then see if the point is too far north...
                const yDiff = yBound - this._map.latLngToContainerPoint(this._latlng).y
                if (yDiff > 0) {
                    this.options.position = 's'
                }
                // or too far east...
                let xDiff = this._map.latLngToContainerPoint(this._latlng).x - (this._map.getSize().x - xBound)
                if (xDiff > 0) {
                    this.options.position += 'w'
                } else {
                    // or too far west.
                    xDiff = xBound - this._map.latLngToContainerPoint(this._latlng).x
                    if (xDiff > 0) {
                        this.options.position += 'e'
                    }
                }

                // Create the necessary DOM elements in the correct order. Pure 'n' and 's' conditions need only one class for styling, others need two.
                if (/s/.test(this.options.position)) {
                    if (this.options.position === 's') {
                        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container)
                        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container)
                    } else {
                        this._tipContainer = L.DomUtil.create(
                            'div',
                            prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position,
                            container,
                        )
                        wrapper = this._wrapper = L.DomUtil.create(
                            'div',
                            prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + this.options.position,
                            container,
                        )
                    }
                    this._tip = L.DomUtil.create(
                        'div',
                        prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position,
                        this._tipContainer,
                    )
                    L.DomEvent.disableClickPropagation(wrapper)
                    this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper)
                    L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation)
                    if (closeButton) closeButton.style.top = '20px'
                } else {
                    if (this.options.position === 'n') {
                        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container)
                        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container)
                    } else {
                        wrapper = this._wrapper = L.DomUtil.create(
                            'div',
                            prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + this.options.position,
                            container,
                        )
                        this._tipContainer = L.DomUtil.create(
                            'div',
                            prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position,
                            container,
                        )
                    }
                    L.DomEvent.disableClickPropagation(wrapper)
                    this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper)
                    L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation)
                    this._tip = L.DomUtil.create(
                        'div',
                        prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position,
                        this._tipContainer,
                    )
                }
            },

            _updatePosition: function () {
                const pos = this._map.latLngToLayerPoint(this._latlng)
                const is3d = L.Browser.any3d
                const offset = new L.Point(...this.options.offset)

                L.DomUtil.setPosition(this._container, pos)

                if (/s/.test(this.options.position)) {
                    this._containerBottom = -this._container.offsetHeight + offset.y - (is3d ? 0 : pos.y)
                } else {
                    this._containerBottom = -offset.y - (is3d ? 0 : pos.y)
                }

                if (/e/.test(this.options.position)) {
                    this._containerLeft = offset.x + (is3d ? 0 : pos.x)
                } else if (/w/.test(this.options.position)) {
                    this._containerLeft = -Math.round(this._containerWidth) + offset.x + (is3d ? 0 : pos.x)
                } else {
                    this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (is3d ? 0 : pos.x)
                }

                this._container.style.bottom = this._containerBottom + 'px'
                this._container.style.left = this._containerLeft + 'px'
            },
        })
        document.head.appendChild(document.createElement('style')).appendChild(
            document.createTextNode(`/* Rrose layout */

.leaflet-rrose {
position: absolute;
text-align: center;
}

.leaflet-rrose-content-wrapper {
padding: 1px;
text-align: left;
}

.leaflet-rrose-content {
margin: 14px 20px;
}

.leaflet-rrose-tip-container {
margin: 0 auto;
width: 40px;
height: 20px;
position: relative;
overflow: hidden;
}

.leaflet-rrose-tip-container-se, .leaflet-rrose-tip-container-ne {
margin-left: 0;
}

.leaflet-rrose-tip-container-sw, .leaflet-rrose-tip-container-nw {
margin-right: 0;
}

.leaflet-rrose-tip {
width: 15px;
height: 15px;
padding: 1px;

-moz-transform: rotate(45deg);
-webkit-transform: rotate(45deg);
-ms-transform: rotate(45deg);
-o-transform: rotate(45deg);
transform: rotate(45deg);
}

.leaflet-rrose-tip-n {
margin: -8px auto 0;
}

.leaflet-rrose-tip-s {
margin: 11px auto 0;
}

.leaflet-rrose-tip-se {
margin: 11px 11px 11px -8px; overflow: hidden;
}

.leaflet-rrose-tip-sw {
margin: 11px 11px 11px 32px; overflow: hidden;
}

.leaflet-rrose-tip-ne {
margin: -8px 11px 11px -8px; overflow: hidden;
}

.leaflet-rrose-tip-nw {
margin: -8px 11px 11px 32px; overflow: hidden;
}

a.leaflet-rrose-close-button {
position: absolute;
top: 0;
right: 0;
padding: 4px 5px 0 0;
text-align: center;
width: 18px;
height: 14px;
font: 16px/14px Tahoma, Verdana, sans-serif;
color: #c3c3c3;
text-decoration: none;
font-weight: bold;
}

a.leaflet-rrose-close-button:hover {
color: #999;
}

.leaflet-rrose-content p {
margin: 18px 0;
}

.leaflet-rrose-scrolled {
overflow: auto;
border-bottom: 1px solid #ddd;
border-top: 1px solid #ddd;
}

/* Visual appearance */

.leaflet-rrose-content-wrapper, .leaflet-rrose-tip {
background: white;

box-shadow: 0 3px 10px #888;
-moz-box-shadow: 0 3px 10px #888;
-webkit-box-shadow: 0 3px 14px #999;
}

.leaflet-rrose-content-wrapper {
-moz-border-radius:    20px;
-webkit-border-radius: 20px;
border-radius:         20px;
}

.leaflet-rrose-content-wrapper-se {
-moz-border-radius:    0 20px 20px 20px;
-webkit-border-radius: 0 20px 20px 20px;
border-radius:         0 20px 20px 20px;
}

.leaflet-rrose-content-wrapper-sw {
-moz-border-radius:    20px 0 20px 20px;
-webkit-border-radius: 20px 0 20px 20px;
border-radius:         20px 0 20px 20px;
}

.leaflet-rrose-content-wrapper-nw, .leaflet-rrose-content-wrapper-w {
-moz-border-radius:    20px 20px 0 20px;
-webkit-border-radius: 20px 20px 0 20px;
border-radius:         20px 20px 0 20px;
}

.leaflet-rrose-content-wrapper-ne, .leaflet-rrose-content-wrapper-e {
-moz-border-radius:    20px 20px 20px 0;
-webkit-border-radius: 20px 20px 20px 0;
border-radius:         20px 20px 20px 0;
}

.leaflet-rrose-content {
font: 12px/1.4 "Helvetica Neue", Arial, Helvetica, sans-serif;
}`),
        )
    }
})()
