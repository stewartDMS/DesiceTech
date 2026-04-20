import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { AdminLayoutService } from 'src/app/Layout/admin-layout/admin-layout.service';
import { CommonService } from 'src/app/shared/common.service';
import *as moment from 'moment';

export type earningChartOption = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  markers: ApexMarkers
};
export type breakupChartOption = {
  color: any;
  series: ApexNonAxisChartSeries;
  labels: any;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors: any;
  responsive: any;
  tooltip: ApexTooltip;
};
export type revenueChartOption = {
  color: any;
  grid: ApexGrid;
  series: ApexAxisChartSeries;
  labels: any;
  xaxis: ApexXAxis;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  colors: any;
  responsive: any;
  tooltip: ApexTooltip;
};

const TIME = ['2019-01-01', '2019-01-02', '2019-01-03', '2019-01-04', '2019-01-05', '2019-01-06', '2019-01-07', '2019-01-08', '2019-01-09', '2019-01-10']

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  count: any;
  selectedMonthandYear: any = null;
  TotalExpenseEarning: any = 0;
  totalCurrentMonthExpenseEarning: any = 0
  monthYearList: any[] = [];
  monthlyEarning: any[] = [];
  totalOfMonthlyEarnings: any = 0;
  yearlyBreakUpEarning: any[] = [];
  yearlyBreakUpEarningYears: any[] = [];
  totalOfYearlyBreakupEarnings: any = 0;
  public earningChartOption: Partial<earningChartOption>;
  public breakupChartOption: Partial<breakupChartOption>;
  public revenueChartOption: Partial<revenueChartOption>;

  constructor(public router: Router, public commonService: CommonService, public adminService: AdminLayoutService) { }

  ngOnInit(): void {

    const script1 = document.createElement('script');
    const script2 = document.createElement('script');
    const script3 = document.createElement('script');
    script1.src = '../../../assets/js/owl.carousel.min.js';
    script3.src = '../../../assets/js/apexcharts.min.js';
    script2.src = '../../../assets/js/dashboard.js';
    document.body.appendChild(script3);
    document.body.appendChild(script1);
    document.body.appendChild(script2);

    this.adminService.getHomeCount().subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.count = Response.data;
      }
    })

    this.earningChartOption = {
      chart: {
        id: "sparkline3",
        type: "area",
        height: 60,
        sparkline: {
          enabled: true,
        },
        group: "sparklines",
        fontFamily: "Plus Jakarta Sans', sans-serif",
        foreColor: "#adb0bb",
      },
      series: [
        {
          name: "Earnings",
          color: "var(--bs-secondary)",
          data: [],
        },
      ],
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0.15,
          opacityTo: 0,
          // stops: [20, 180],
        },
        opacity: 0.5,
      },
      markers: {
        size: 0,
      },
      tooltip: {
        theme: "dark",
        x: {
          show: false,
        },
      },
    }
    this.breakupChartOption = {
      color: "#adb5bd",
      series: [],
      labels: [],
      chart: {
        width: 180,
        type: "donut",
        fontFamily: "Plus Jakarta Sans', sans-serif",
        foreColor: "#adb0bb",
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          donut: {
            size: "75%",
          },
        },
      },
      stroke: {
        show: false,
      },

      dataLabels: {
        enabled: false,
      },

      legend: {
        show: false,
      },
      colors: ["var(--bs-primary)", "#ecf2ff", "var(--bs-card-bg)"],

      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ],
      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
      },
    }
    this.revenueChartOption = {
      series: [{
        name: 'Expenses this month',
        data: []
      }],
      chart: {
        type: "bar",
        height: 320,
        stacked: true,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        foreColor: "#adb0bb",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          barHeight: "60%",
          columnWidth: "20%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#007BFF", "#6610f2"],
      xaxis: {
        type: 'datetime',
        tickAmount: 1,
        labels: {
          formatter: val => moment(val).format('DD/MM/YYYY')
        }
      },
      tooltip: {
        theme: "dark",
      },
      grid: {
        borderColor: "rgba(0,0,0,0.1)",
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      legend: {
        show: false,
      },
    };


    this.getMonthandYearCharts();
    this.getCurrentYearMonthList();
  }

  getMonthandYearCharts() {
    this.adminService.monthwiseEarlingCounts().subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.monthlyEarning = Response.data.list;
        this.totalOfMonthlyEarnings = Response.data.finalTotal;

        this.earningChartOption = {
          chart: {
            id: "sparkline3",
            type: "area",
            height: 60,
            sparkline: {
              enabled: true,
            },
            group: "sparklines",
            fontFamily: "Plus Jakarta Sans', sans-serif",
            foreColor: "#adb0bb",
          },
          series: [
            {
              name: "Earnings",
              color: "var(--bs-secondary)",
              data: this.monthlyEarning,
            },
          ],
          stroke: {
            curve: "smooth",
            width: 2,
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 0,
              inverseColors: false,
              opacityFrom: 0.15,
              opacityTo: 0,
              // stops: [20, 180],
            },
            opacity: 0.5,
          },
          markers: {
            size: 0,
          },
          tooltip: {
            theme: "dark",
            x: {
              show: false,
            },
          },
        }
      }
    })
    this.adminService.yearlyEarlingCounts().subscribe((Response: any) => {
      if (Response.meta.code == 200) {

        this.yearlyBreakUpEarning = Response.data.list;
        this.yearlyBreakUpEarningYears = Response.data.year;
        this.totalOfYearlyBreakupEarnings = Response.data.finalTotal;


        this.breakupChartOption = {
          color: "#adb5bd",
          series: this.yearlyBreakUpEarning,
          labels: this.yearlyBreakUpEarningYears,
          chart: {
            width: 180,
            type: "donut",
            fontFamily: "Plus Jakarta Sans', sans-serif",
            foreColor: "#adb0bb",
          },
          plotOptions: {
            pie: {
              startAngle: 0,
              endAngle: 360,
              donut: {
                size: "75%",
              },
            },
          },
          stroke: {
            show: false,
          },

          dataLabels: {
            enabled: false,
          },

          legend: {
            show: false,
          },
          colors: ["var(--bs-primary)", "#ecf2ff", "var(--bs-card-bg)"],

          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: "bottom"
                }
              }
            }
          ],
          tooltip: {
            theme: "dark",
            fillSeriesColor: false,
          },
        }
      }
    })
  }

  getRevenueExpenseChart(month: string, year: number) {
    this.adminService.revenueExpenseCounts({ month: month, year: year }).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.TotalExpenseEarning = Response.data.totalExpense;
        this.totalCurrentMonthExpenseEarning = Response.data.totalOfCurrentMonthExpense;

        this.revenueChartOption = {
          series: [{
            name: 'Expenses this month',
            data: Response.data.option
          }],
          chart: {
            type: "bar",
            height: 320,
            stacked: true,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            foreColor: "#adb0bb",
          },
          plotOptions: {
            bar: {
              horizontal: false,
              barHeight: "60%",
              columnWidth: "20%",
            },
          },
          dataLabels: {
            enabled: false,
          },
          colors: ["#007BFF", "#6610f2"],
          xaxis: {
            type: 'datetime',
            tickAmount: 1,
            labels: {
              formatter: val => moment(val).format('DD/MM/YYYY')
            }
          },
          tooltip: {
            theme: "dark",
          },
          grid: {
            borderColor: "rgba(0,0,0,0.1)",
            strokeDashArray: 3,
            xaxis: {
              lines: {
                show: false,
              },
            },
          },
          legend: {
            show: false,
          },
        };
      }
    })
  }

  getCurrentYearMonthList() {
    this.adminService.monthYearList().subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.monthYearList = Response.data;

        let date = moment().format('MM-yyyy');
        let checkValue = this.monthYearList.filter((x: any) => x.value == date);
        if (checkValue.length > 0) {
          this.selectedMonthandYear = date;
        }
        else {
          this.selectedMonthandYear = this.monthYearList[this.monthYearList.length - 1]
        }

        this.getRevenueExpenseChart(this.selectedMonthandYear.split('-')[0], this.selectedMonthandYear.split('-')[1]);

      }
      else {
        this.monthYearList = [];
      }
    })
  }

  getRevenueChart() {
    this.getRevenueExpenseChart(this.selectedMonthandYear.split('-')[0], this.selectedMonthandYear.split('-')[1]);
  }


}

