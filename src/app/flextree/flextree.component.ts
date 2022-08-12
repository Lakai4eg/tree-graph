import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import {
  BaseType,
  HierarchyNode,
  Selection,
  TreeLayout,
  ZoomBehavior,
  ZoomedElementBaseType,
} from 'd3';
import { chartData as data, chartOptions } from './d3.const';

type Children = {
  name: string;
  children?: Children[];
  idx?: number;
  x?: number;
  y?: number;
};

type Coordinate = {
  x: number;
  y: number;
};

interface IDragVariables {
  shiftX: number;
  shiftY: number;
  draggedElement: Selection<BaseType, unknown, HTMLElement, any>;
  initTransform: string;
  dragStarted: boolean;
}

@Component({
  selector: 'app-flextree',
  templateUrl: './flextree.component.html',
  styleUrls: ['./flextree.component.scss'],
})
export class FlextreeComponent implements AfterViewInit {
  private treeLayout: TreeLayout<Children>;
  private root: HierarchyNode<Children>;
  private svg: any; // SVGElement
  private g: any; // SVG Group
  private zoom: ZoomBehavior<ZoomedElementBaseType, unknown>;
  private dragVars: IDragVariables = {
    shiftX: undefined,
    shiftY: undefined,
    draggedElement: undefined,
    initTransform: undefined,
    dragStarted: undefined,
  };

  constructor(public elementRef: ElementRef) {}

  @ViewChild('chart4', { static: true }) private chartContainer: ElementRef;

  ngAfterViewInit(): void {
    this.createLayout();
    this.assignData();
    this.createSVG();
    this.initZoom();
    this.update();
    this.initDrag();
  }

  private update(): void {
    const removeNodes = this.g.selectAll('.link').exit().remove();
    // добавляем линии - связи между блоками
    const links = this.g
      .selectAll('.link')
      .data(this.root.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d) =>
        this.line({ x: d.parent.x, y: d.parent.y }, { x: d.x, y: d.y })
      );

    // adds each node as a group
    const nodes = this.g
      .selectAll('.node')
      .data(this.root.descendants())
      .enter()
      .append('g')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y);

    // Рисуем прямоугольники
    nodes
      .append('rect')
      .attr('class', 'node')
      .attr('width', chartOptions.blockWidth)
      .attr('height', chartOptions.blockHeight)
      .attr('rx', 5);

    // Добавляем лейблы
    nodes
      .append('text')
      .attr('x', chartOptions.blockWidth / 2)
      .attr('y', chartOptions.blockHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text((d) => {
        // @ts-ignore
        // return d.idx.toString();
        return d.data.name;
      })
      .each(this.wrap);

    // Transition to the proper position for the node
    const nodeUpdate = nodes.merge(nodes);
    nodeUpdate
      .transition()
      .duration(chartOptions.duration)
      .attr('transform', (d: any) => {
        return (
          'translate(' +
          (d.x - chartOptions.blockWidth / 2) +
          ',' +
          (d.y - chartOptions.blockHeight / 2) +
          ')'
        );
      });
  }

  private createLayout(): void {
    // declares a tree layout and assigns the size
    this.treeLayout = d3
      .tree()
      .size([
        chartOptions.chartWidth,
        chartOptions.chartHeight - chartOptions.blockHeight,
      ])
      // 50 - vertical indent
      .nodeSize([
        chartOptions.blockWidth,
        chartOptions.blockHeight + chartOptions.levelHeight,
      ])
      .separation(() => 1.1) as TreeLayout<Children>;
  }

  private assignData(): void {
    //  assigns the data to a hierarchy using parent-child relationships
    this.root = d3.hierarchy(data);
    // создаём id для каждого блока
    this.root.descendants().forEach((myNode: HierarchyNode<Children>, i) => {
      // @ts-ignore
      myNode.idx = i;
    });
    this.treeLayout(this.root);
  }

  private createSVG(): void {
    // Создаём svg-элемент и добавляем его в контейнер
    this.svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', chartOptions.chartWidth)
      .attr('height', chartOptions.chartHeight)
      .attr(
        'viewBox',
        `0, 0, ${chartOptions.chartWidth}, ${
          chartOptions.chartHeight - chartOptions.blockHeight
        }`
      );

    this.g = this.svg.append('g').attr('width', '100%').attr('height', '100%');
  }

  private initZoom(): void {
    this.zoom = d3.zoom().on('zoom', (event) => {
      this.g.attr('transform', event.transform);
    });
    this.svg.call(this.zoom);
    // центрируем график
    this.zoom.translateTo(this.svg, 0, 0, [
      chartOptions.chartWidth / 2,
      chartOptions.blockHeight / 2,
    ]);
  }

  private initDrag(): void {
    const drag = d3
      .drag()
      .on('start', this.dragstart.bind(this))
      .on('drag', this.dragged.bind(this))
      .on('end', this.dragend.bind(this));
    this.g.selectAll('.node').call(drag);
  }

  // -----------------------  Drag handlers
  private dragstart(event, d): void {
    event.sourceEvent.stopPropagation();
    if (d === this.root) {
      return;
    }
    this.dragVars.draggedElement = d3.select(event.sourceEvent.currentTarget);
    this.dragVars.draggedElement.classed('dragging', true);
    this.dragVars.draggedElement.attr('pointer-events', 'none');
    console.log('start', this.dragVars.draggedElement.attr('transform'));

    this.dragVars.dragStarted = true;
    this.dragVars.shiftX =
      event.sourceEvent.clientX -
      event.sourceEvent.target.getBoundingClientRect().left;
    this.dragVars.shiftY =
      event.sourceEvent.clientY -
      event.sourceEvent.target.getBoundingClientRect().top;
    this.dragVars.initTransform =
      this.dragVars.draggedElement.attr('transform');
  }

  private dragged(event, d): void {
    if (d === this.root) {
      return;
    }
    this.dragVars.draggedElement.attr(
      'transform',
      `translate(${+event.x - this.dragVars.shiftX}, ${
        event.y - this.dragVars.shiftY
      })`
    );
  }

  private dragend(event, d): void {
    event.sourceEvent.preventDefault();
    this.dragVars.draggedElement.classed('dragging', false);
    this.dragVars.draggedElement.attr('pointer-events', null);
    console.log('end', this.dragVars.draggedElement.attr('transform'));
    const endBlockData = event.sourceEvent.target.__data__;

    // Если нет элемента под блоком, возвращаем назад
    if (!endBlockData) {
      this.dragVars.draggedElement.attr(
        'transform',
        this.dragVars.initTransform
      );
    } else {
      if (!endBlockData.children) {
        endBlockData.children = [];
        endBlockData.data.children = [];
      }
      endBlockData.children.push(d);
      endBlockData.data.children.push(d.data);
      d.parent.children.filter((child) => child.idx !== d.idx);
      d.parent = endBlockData;
      this.update();
    }
    this.clearDragVariables();
    console.log(endBlockData);
  }

  private clearDragVariables(): void {
    Object.keys(this.dragVars).forEach((x) => {
      this.dragVars[x] = undefined;
    });
  }

  /**
   * Рисует кривую линию между двумя точками
   */
  private line(s: Coordinate, t: Coordinate): string {
    const x = s.x;
    const y = s.y;
    const ex = t.x;
    const ey = t.y;

    const xrvs = ex - x < 0 ? -1 : 1;
    const yrvs = ey - y < 0 ? -1 : 1;

    const rdef = 35;
    let r = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;

    r = Math.abs(ey - y) / 2 < r ? Math.abs(ey - y) / 2 : r;

    const h = Math.abs(ey - y) / 2 - r;
    const w = Math.abs(ex - x) - r * 2;
    return `
            M ${x} ${y}
            L ${x} ${y + h * yrvs}
            C  ${x} ${y + h * yrvs + r * yrvs} ${x} ${
      y + h * yrvs + r * yrvs
    } ${x + r * xrvs} ${y + h * yrvs + r * yrvs}
            L ${x + w * xrvs + r * xrvs} ${y + h * yrvs + r * yrvs}
            C  ${ex}  ${y + h * yrvs + r * yrvs} ${ex}  ${
      y + h * yrvs + r * yrvs
    } ${ex} ${ey - h * yrvs}
            L ${ex} ${ey}`;
  }

  /**
   * Функция для обрезки лейблов с text-ellipsis
   */
  private wrap(node, index, textElements): void {
    const self = d3.select(textElements[index]);
    let textLength = self.node().getComputedTextLength();
    let text = self.text();
    // 20 - paddings
    while (textLength > chartOptions.blockWidth - 20 && text.length > 0) {
      text = text.slice(0, -1);
      self.text(text + '...');
      textLength = self.node().getComputedTextLength();
    }
  }
}
