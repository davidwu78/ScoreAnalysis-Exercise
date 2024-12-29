/* eslint-disable */

/* 
 * Caution!
 * These graph functions is the same as the original version.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import * as d3 from 'd3';
import $ from 'jquery';
import { withTranslation } from 'react-i18next';

const mapStateToProps = (state) => ({
  currentUser: state.user
});

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.init_linechart = this.init_linechart.bind(this);
    this.data_filter = this.data_filter.bind(this);
  }
  componentDidMount() {
    const { matchId } = this.props;
    this.init_linechart(matchId);
  }
  componentDidUpdate(prevProps) {
    if (this.props.set !== prevProps.set) {
      const { matchId } = this.props;
      this.init_linechart(matchId);
    }
  }
  async init_linechart(matchId) {
    var line = document.getElementById("line");
    while(line.firstChild) {
      line.removeChild(line.firstChild);
    }
    let data;
    let { set } = this.props;
    const { playerName, rivalName } = this.props;
    let minrally = undefined;
    let maxrally = undefined;


          // TODO: 初始化資料
          // 使用 axios 從 API 獲取資料
          // 提示: 
          // 1. 使用 try-catch 處理 API 請求
          // 2. API endpoint: `${process.env.REACT_APP_API_URL}/count`
          // 3. 需要傳入 match 和 id_token 參數
    try {
      const { idToken } = this.props.currentUser;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/count?match=${matchId}&id_token=${idToken}`);
          // 在此實作 API 請求
          // const response = await ...
      if (response.status !== 200) {
        throw Error(response.statusText);
      }
      data = response.data;
    } catch (error) {
      console.log(error);
      return;
    }
    [data,set,minrally,maxrally] = this.data_filter(data,set,minrally,maxrally,0);

    var posx = 150;
    var posy = 20;

    var canv = document.createElement('canvas');
    canv.id = 'line_chart';
    canv.width = 640;
    canv.height = 245;
    document.getElementById("line").appendChild(canv);

    var chartRadarDOM;
    var chartRadarOptions;

    chartRadarDOM = document.getElementById("line_chart");
    //custormized options
    chartRadarOptions =
    {
      legend:{
        display: false
      },
      scales:{
        xAxes: [{
          scaleLabel:{
            display: true,
            labelString: this.props.t('single.graph.scoreTrend.rally'),
            fontSize: 16
          },
          gridLines: {
            display: false
          }
        }],
        yAxes: [{
          ticks:{
            beginAtZero: true,
          },
          scaleLabel:{
            display: true,
            labelString: this.props.t('single.graph.scoreTrend.shotNumber'),
            fontSize: 16
          }
        }]
      },
      elements: {
        line: {
          tension: 0 // disables bezier curves
        }
      },
      animation: {
        duration: 1,
        onComplete: function() {
        var chartInstance = this.chart,
        ctx = chartInstance.ctx;

        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(0,0,0,1)';

        this.data.datasets.forEach(function(dataset, i) {
          var meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach(function(bar, index) {
          var data = dataset.data[index];
          ctx.fillText(data, bar._model.x, bar._model.y - 5);
          });
        });
        }
      }
    };
    var labels = data.map(function(e) {
      return e.rally;
    });

    var datas = data.map(function(e) {
      return e.stroke;
    });

    var pointcolor = [];
    var datadown = [];
    var datainterval = [];
    var dataup = [];
    for (var i = 0;i<data.length;i++){
      if (data[i].rally < minrally){
        datadown.push(data[i].stroke);
        datainterval.push(null);
        dataup.push(null);
      }
      else if (data[i].rally > maxrally){
        datadown.push(null);
        datainterval.push(null);
        dataup.push(data[i].stroke);
      }
      else{
        if (data[i].rally == minrally){
          datadown.push(data[i].stroke);
          datainterval.push(data[i].stroke);
          dataup.push(null);
        }
        else if (data[i].rally == maxrally){
          datadown.push(null);
          datainterval.push(data[i].stroke);
          dataup.push(data[i].stroke);
        }
        else{
          datadown.push(null);
          datainterval.push(data[i].stroke);
          dataup.push(null);
        }
      }

      if (data[i].rally < minrally || data[i].rally > maxrally)
        pointcolor.push("rgb(216, 212, 212)");
      else if(data[i].winner == 'A')
        pointcolor.push("rgb(255, 204, 37)");
      else
        pointcolor.push("rgb(67, 219, 229)");
    }
    var segment_data=[];
    var consec_point=[];
    for (var i = 0;i<data.length-1;) {
      var point_data=[];
      if (data[i].rally < minrally || data[i].rally >= maxrally) {
        i+=1;
        continue;
      }
      if(i==data.length-2){
        point_data.push(i);
        point_data.push(i+1);
        segment_data.push(point_data);
        break;
      }

      if(data[i].winner==data[i+1].winner){
        consec_point.push(i);
        while(data[i].winner==data[i+1].winner){
          if(i>=data.length-2){
            point_data.push(i);
            i+=1;
            break;
          }
          point_data.push(i);
          i+=1;
        }
        point_data.push(i);
      }
      else if(data[i].winner!=data[i+1].winner){
        while(data[i].winner!=data[i+1].winner){
          if(i>=data.length-2){
            point_data.push(i);
            i+=1;
            break;
          }
          point_data.push(i);
          i+=1;
        }
        point_data.push(i);
      }
      segment_data.push(point_data);
      if(i==data.length-1){
        break;
      }
    }
    var final_data=new Array();
    for (var i = 0;i<data.length;i++) {
      final_data[i]=new Array();
    }
    for (var i = 0;i<segment_data.length;i++) {
      for(var j = 0;j<data.length;j++){
        var match=0;
        for(var k=0;k<segment_data[i].length;k++){
          if(j==segment_data[i][k]){
            match=1;
            break;
          }
        }
        if(match==1){
          final_data[i].push(data[j].stroke);
        }
        else{
          final_data[i].push(null);
        }
      }
    }
    var present_data=[];
    for (var i = 0;i<segment_data.length;i++) {
      var linecolor;
      for(var j=0;j<consec_point.length;j++){
        if(segment_data[i][0]==consec_point[j]){
          if(data[segment_data[i][0]].winner=='A'){
            linecolor="rgba(255, 204, 37,"+segment_data[i].length*0.2+")";
          }
          if(data[segment_data[i][0]].winner=='B')    {
            linecolor="rgba(67, 219, 229,"+segment_data[i].length*0.2+")";
          }
          //"rgb("+(255-segment_data[i].length*10)+","+(236-segment_data[i].length*10)+","+(203-segment_data[i].length*10)+")";
          break;
        }
        else{
          linecolor="#ebff78";
        }
      }

      present_data.push({fill: false,
            cubicInterpolationMode:"monotone",
            backgroundColor: "rgba(255, 204, 37,0.2)",
            borderColor: linecolor,
            pointBorderColor: "#fff",
            pointBackgroundColor:pointcolor,
            pointRadius: 4,
            pointHoverRadius: 6,
            data: final_data[i]});
    }
    var datatotal=[
            {
              fill: false,
              cubicInterpolationMode:"monotone",
              backgroundColor: "rgba(255, 204, 37,0.2)",
              borderColor: "rgba(216, 212, 212, 0.5)",
              pointBorderColor: "#fff",
              pointBackgroundColor:pointcolor,
              pointRadius: 4,
              pointHoverRadius: 6,
              data: datadown
            }
            ];
    for(var i=0;i<segment_data.length;i++){
      datatotal.push(present_data[i]);
    }
    datatotal.push({
              fill: false,
              cubicInterpolationMode:"monotone",
              backgroundColor: "rgba(255, 204, 37,0.2)",
              borderColor: "rgba(216, 212, 212, 0.5)",
              pointBorderColor: "#fff",
              pointBackgroundColor:pointcolor,
              pointRadius: 4,
              pointHoverRadius: 6,
              data: dataup
            });

    var chart = new Chart(chartRadarDOM, {
      type: 'line',
      data:{
        labels: labels,
        datasets:datatotal
      },
      options: chartRadarOptions
    });

    //click point handling
    canv.onclick = async function(evt){
      var activepoints = chart.getElementAtEvent(evt);
      if (activepoints[0]){
        var id = set + '-' + (activepoints[0]['_index']+1)
        // console.log(id)

        let game_name = undefined;
        //init game
        if (!game_name){
          game_name = "18IND_TC";
        }

        let data2;
          // TODO: 初始化資料
          // 使用 axios.get 從 API 獲取資料
          // 提示: 
          // 1. 使用 try-catch 處理 API 請求
          // 2. API endpoint: `${process.env.REACT_APP_API_URL}/count`
          // 3. 需要傳入 match 和 id_token 參數
          try {
            const { idToken } = this.props.currentUser;
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/count?match=${matchId}&id_token=${idToken}`);
                // 在此實作 API 請求
                // const response = await ...
            if (response.status !== 200) {
              throw Error(response.statusText);
            }
            data = response.data;
          } catch (error) {
          console.log(error);
          return;
        }
        document.getElementById("rallytitle").innerHTML = `第 ${set} 局 - 第 ${activepoints[0]['_index']+1} 回合`;
        //filter data to specific set
        data2 = data2.filter(function(item) {
          return item.set == set
        });
        data2 = data2[0].info;

        //get index from json file
        let index = data2.findIndex(function(item){
          return id.split('-')[1] == item.rally;
        });

        var labels = data2.map(function(item) {
          return item.result.map(function(e){
            return e.balltype;
          })
        });

        var dataA = [];
        for(var i = 0;i<data2[index].result.length;i++){
          dataA.push(data2[index].result[i].count)
        }

        var dataB = [];
        for(var i = 0;i<data2[index+1].result.length;i++){
          dataB.push(data2[index+1].result[i].count)
        }


        $("#radarChart").show(function(event){
          //filter data to specific rally
          let data_choose = data.filter(function(item) {
            return item.rally == id.split('-')[1];
          });
          data_choose = data_choose[0];
          // console.log(data_choose);

          // show win_reason and lose balltype on each rally
          document.getElementById("lose_reason").innerHTML = '失分原因：' + data_choose.on_off_court;
          document.getElementById("lose_balltype").innerHTML = '失分球種：' + data_choose.balltype;

          var modal = $(this);
          var canvas = modal.find('.modal-body canvas');
          var ctx = canvas[0].getContext("2d");
          var chart = new Chart(ctx, {
            type: "radar",
            data: {
              labels: labels[0],
              datasets: [
                {
                label: playerName,
                fill: true,
                backgroundColor: "rgba(255, 204, 37,0.6)",
                borderColor: "rgba(255, 204, 37,0.6)",
                pointBorderColor: "#fff",
                pointBackgroundColor: "rgba(255, 204, 37,1)",
                data: dataA
                }, {
                label: rivalName,
                fill: true,
                backgroundColor: "rgba(67, 219, 229,0.6)",
                borderColor: "rgba(67, 219, 229,1)",
                pointBorderColor: "#fff",
                pointBackgroundColor: "rgba(67, 219, 229,1)",
                pointBorderColor: "#fff",
                data: dataB
                }
              ]
            },
            options: {
              scale:{
                ticks:{
                  min:0,
                  stepSize:1
                },
                pointLabels: {
                  fontSize:14
                }
              },
              legend:{
                display: false,
                labels:{
                  fontColor: 'rgba(248, 184, 82, 1)',
                  fontSize: 16
                }
              }
            }
          });
        });

        //close modal chart
        $(function() {
          $('.close').click(function() {
            $('#radarChart').hide(function(event){
              var modal = $(this);
              var canvas = modal.find('.modal-body canvas');
              var ctx = canvas[0].getContext("2d");
              $(".modal-body canvas").remove();
              $(".modal-body").html('<canvas id="canvas" width="1000" height="800"></canvas>\
                        <div class="modal-text" id="lose_reason"></div>\
                        <div class="modal-text" id="lose_balltype"></div>');
            });
          });
        });
      }
    }
  }
  data_filter(data, set, minrally, maxrally, mode){
    // 0 means all sets
    if (set === 0) {
        let data_all = []; 
        for (let i = 0; i < data.length; i++) 
            data_all = data_all.concat(data[i].result);
        return [data_all,set,minrally,maxrally];
    }

    //init set
    if (!set){
        set = 1;
    }
    if (set===(data.length+1)){
        // console.log(data)
        let data_tmp=data[0].result.concat(data[1].result);
        if (data.length===3){
          data_tmp=data_tmp.concat(data[2].result);
        }

        data = data_tmp;
        // console.log(data)
        return [data,set,minrally,maxrally];
    }
    //filter data to specific set
    data = data.filter(function(item) {
        return item.set === set
    });
    data = data[0].result;
    // init minrally and maxrally if are undefined,null,0,NaN,empty string,false
    if (!minrally){
        minrally = Math.min.apply(Math, data.map(function(d) {
            return d.rally;
        }));
    }
    if (!maxrally){
        maxrally = Math.max.apply(Math, data.map(function(d) {
            return d.rally;
        }));
    }

    if(mode === 1){
        //filter data to specific interval
        data = data.filter(function(item) {
            return item.rally >= minrally && item.rally <= maxrally
        });
    }

    return [data,set,minrally,maxrally];
  }
  render() {
    return (
      <>
        <div id="line" style={{ width: '100%', background: '#f5fafa' }} />
        <div className="modal" id="radarChart" role="dialog" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button id="closechart" type="button" className="close ml-0" data-dismiss="modal">
                  <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
                </button>
                <h4 className="modal-title" id="rallytitle"></h4>
              </div>
              <div className="modal-body">
                <canvas id="canvas" width="1000" height="800"></canvas>
                <div className="modal-text" id="lose_reason"></div>
                <div className="modal-text" id="lose_balltype"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default withTranslation()(connect(mapStateToProps)(LineChart));
