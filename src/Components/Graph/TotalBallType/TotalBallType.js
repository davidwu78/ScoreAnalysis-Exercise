import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';
import RadarChart from './RadarChart';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
`;

const Chart = styled.div`
  width: 50%;
`;

const CenterText = styled.div`
  width: 100%;
  text-align: center;
  padding: 10px 0;
`;

const mapStateToProps = (state) => ({
  currentUser: state.user
});

class TotalBallType extends Component {
  static filteredByPlayer(data, targetPlayer) {
    const filteredData = data.map((setData) => {
      const newInfo = setData.info.filter((rallyData) => {
        const { player } = rallyData;
        if (player === targetPlayer) {
          return true;
        }
        return false;
      });
      const newSetData = {
        info: newInfo,
        set: setData.set
      };
      return newSetData;
    });
    return filteredData;
  }
  constructor(props) {
    super(props);
    this.state = {
      playerDataA: {
        網前球: 0,
        推撲球: 0,
        挑球: 0,
        平球: 0,
        接殺防守: 0,
        切球: 0,
        殺球: 0,
        長球: 0,
        發短球: 0,
        發長球: 0
      },
      playerDataB: {
        網前球: 0,
        推撲球: 0,
        挑球: 0,
        平球: 0,
        接殺防守: 0,
        切球: 0,
        殺球: 0,
        長球: 0,
        發短球: 0,
        發長球: 0
      }
    };
    this.getData = this.getData.bind(this);
    this.filteredBySet = this.filteredBySet.bind(this);
    this.calculateGraphData = this.calculateGraphData.bind(this);
  }
  componentDidMount() {
    const { matchId } = this.props;
    this.getData(matchId);
  }
  componentDidUpdate(prevProps) {
    if (this.props.set !== prevProps.set) {
      const { matchId } = this.props;
      this.getData(matchId);
    }
  }
  async getData(matchId) {
    const { idToken } = this.props.currentUser;

          // TODO: 初始化資料
          // 提示: 使用 axios.get 從 API 獲取資料
          // 提示: 
          // 1. 使用 try-catch 處理 API 請求
          // 2. API endpoint: `${process.env.REACT_APP_API_URL}/simple_type`
          // 3. 需要傳入 match 和 id_token 參數
          try {
            // 在此實作 API 請求
            // const response = await ...
          
          // if (response.status !== 200) {
          //   throw Error(response.statusText);
          // }
    
          /* 資料過濾
         * 使用 this.filteredBySet() 依據目前選擇的局數過濾資料
         * 參數: response.data (API 回應的資料)
         * 功能: 過濾出指定局數的資料，如果選擇全部局數則返回所有資料
         */
          // const filteredData = this.filteredBySet(response.data);
    
          /* TODO: 分離 A、B 方資料
         * 使用 TotalBallType.filteredByPlayer() 分別過濾出 A、B 兩方的資料
         * 參數 1: filteredData (已依據局數過濾的資料)
         * 參數 2: 'A' 或 'B' (指定要過濾的球員)
         * 功能: 過濾出該球員失分的資料
         */
          // const dataPlayerA = 
          // const dataPlayerB = 
    
          // this.calculateGraphData(dataPlayerA, 'A');
          // this.calculateGraphData(dataPlayerB, 'B');
        } catch (error) {
          console.log(error);
        }
  }
  calculateGraphData(data, playerID) {
    const totalBallTypeData = {
      網前球: 0,
      推撲球: 0,
      挑球: 0,
      平球: 0,
      接殺防守: 0,
      切球: 0,
      殺球: 0,
      長球: 0,
      發短球: 0,
      發長球: 0
    };
    data.forEach((setData) => {
      setData.info.forEach((rallyData) => {
        rallyData.result.forEach((ballTypeData) => {
          const { balltype, count } = ballTypeData;
          if (count > 0 && Object.prototype.hasOwnProperty.call(totalBallTypeData, balltype)) {
            totalBallTypeData[balltype] += count;
          }
        });
      });
    });
    if (playerID === 'A') {
      this.setState({ playerDataA: totalBallTypeData });
    } else if (playerID === 'B') {
      this.setState({ playerDataB: totalBallTypeData });
    }
  }
  filteredBySet(data) {
    const { set } = this.props;
    if (set === process.env.REACT_APP_ALL_SET) {
      return data;
    }
    return data.filter((element) => element.set === set);
  }
  render() {
    const {
      playerDataA,
      playerDataB
    } = this.state;
    const { playerName, rivalName } = this.props;
    let max = Math.max(...Object.values(playerDataA), ...Object.values(playerDataB));
    max = (Math.ceil(max / 10)) * 10;
    const dataAsum = Object.values(playerDataA).reduce((acc, cur) => acc + cur, 0);
    const dataBsum = Object.values(playerDataB).reduce((acc, cur) => acc + cur, 0);
    if (Object.keys(playerDataA).length > 0
    && Object.keys(playerDataB).length > 0
    && dataAsum > 0 && dataBsum > 0) {
      return (
        <Wrapper>
          <Chart>
            <RadarChart data={playerDataA} playerName={playerName} max={max} player />
          </Chart>
          <Chart>
            <RadarChart data={playerDataB} playerName={rivalName} max={max} />
          </Chart>
        </Wrapper>
      );
    }
    return (<CenterText>Loading...</CenterText>);
  }
}

export default connect(mapStateToProps)(TotalBallType);
