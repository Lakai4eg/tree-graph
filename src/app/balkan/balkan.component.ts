import { AfterViewInit, Component } from '@angular/core';
import OrgChart from '@balkangraph/orgchart.js';

type Node = {
  id: number;
  pid: number;
  name: string;
};

@Component({
  selector: 'app-balkan',
  templateUrl: './balkan.component.html',
  styleUrls: ['./balkan.component.scss'],
})
export class BalkanComponent implements AfterViewInit {
  // https://balkan.app/OrgChartJS
  ngAfterViewInit(): void {
    const chart = new OrgChart(document.getElementById('tree'), {
      enableDragDrop: true,
      nodeBinding: {
        field_0: 'name',
      },
      nodes: this.generateNodes(20),
    });
  }

  private generateName(): string {
    const names = [
      'Aaran',
      'Aaren',
      'Aarez',
      'Aarman',
      'Aaron',
      'Aaron-James',
      'Aarron',
      'Aaryan',
      'Aaryn',
      'Aayan',
      'Aazaan',
      'Abaan',
      'Abbas',
      'Abdallah',
      'Abdalroof',
      'Abdihakim',
      'Abdirahman',
      'Abdisalam',
      'Adain',
      'Adam',
      'Adam-James',
      'Addison',
      'Addisson',
      'Adegbola',
      'Adegbolahan',
      'Aliekber',
    ];
    return names[this.getRandomInt(names.length - 1)];
  }

  private getRandomInt(max): number {
    return Math.floor(Math.random() * max);
  }

  private generateNodes(count: number): Node[] {
    const generatedNodes = [];
    for (let i = 1; i < count; i++) {
      generatedNodes.push({
        id: i,
        pid: this.getRandomInt(i),
        name: this.generateName(),
      });
    }
    return generatedNodes;
  }
}
