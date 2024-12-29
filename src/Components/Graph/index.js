import React, { Component } from 'react';

import styled from 'styled-components';
import { withTranslation } from 'react-i18next';
import Row from 'Themes/components/Row';
import BlockTitle from 'Themes/components/BlockTitle';
import Legend from 'Themes/components/Legend';

import LoseBallType from './LoseBallType/LoseBallType';
import LoseError from './LoseError/LoseError';
import TotalBallType from './TotalBallType/TotalBallType';
import WinBallType from './WinBallType/WinBallType';
import LoseDistribution from './LoseDistribution/LoseDistribution';
import LineChart from './LineChart/LineChart';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 0 10px;
  margin-bottom: 30px;
`;

const SetButtonWrapper = styled.div`
  display: flex;
  padding-bottom: 0;
`;

const SetButton = styled.button`
  cursor: pointer;
  overflow: hidden;
  outline: none;
  color: #3fbbc3;
  border: solid 1px #3fbbc3;
  background: #fff;
  padding: 5px 10px;
  border-radius: 12px;
  height: 40px;
  font-size: 19px;
  margin: 0;
  margin-right: 4px;
  position: relative;
  ${(props) => props.select && `
    color: #fff;
    background: #3fbbc3;
  `}

  :hover{
    color: #fff;
    background: #3fbbc3;
  }

  :focus{
    outline: none;
  }
`;

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targetSet: 1
    };
    this.clickSetButton = this.clickSetButton.bind(this);
  }
  async clickSetButton(targetSet) {
    await this.setState({ targetSet: targetSet });
  }
  render() {
    const {
      matchId, playerName, rivalName, sets, t
    } = this.props;
    const { targetSet } = this.state;
    return (
      <div>
        <Row>
          {
            sets && sets.length > 0 && (
              <SetButtonWrapper>
                {
                  sets.map((set) => (
                    <SetButton
                      select={targetSet === parseInt(set, 10)}
                      key={`graph-set-button-${set}`}
                      onClick={() => { this.clickSetButton(parseInt(set, 10)); }}
                    >
                      {t(`set${set}`)}
                    </SetButton>
                  ))
                }
                <SetButton
                  select={targetSet === process.env.REACT_APP_ALL_SET}
                  onClick={() => { this.clickSetButton(process.env.REACT_APP_ALL_SET); }}
                >
                  {t('all')}
                </SetButton>
              </SetButtonWrapper>
            )
          }
        </Row>
        <Wrapper>
          <Row>
            <BlockTitle
              id="graph-loseType"
              noPadding
              instruction={(
                <>
                  顯示雙方失分原因的類別，以及各個失分類別的多寡，分類如下：
                  <br />
                  出界、對手落地致勝、落點判斷失誤、掛網、未過網
                  <br />
                  滑鼠移至柱狀上會顯示數量
                </>
              )}
            >
              {t('single.graph.loseType.title')}
            </BlockTitle>
          </Row>
          <Row noPadding>
            <Legend
              playerName={playerName}
              rivalName={rivalName}
              center
            />
          </Row>
          <Row>
            <LoseBallType
              matchId={matchId}
              playerName={playerName}
              rivalName={rivalName}
              set={targetSet}
            />
          </Row>
        </Wrapper>
        
        <Wrapper>
          <Row>
            <BlockTitle
              id="graph-ballType"
              noPadding
              instruction={(
                <>
                  以雷達圖顯示雙方選手所擊出的各個球種的數量
                  <br />
                  滑鼠移至點上會顯示數量
                </>
              )}
              placement="top"
              ballType
            >
              {t('single.graph.ballType.title')}
            </BlockTitle>
          </Row>
          <Row noPadding>
            <Legend
              playerName={playerName}
              rivalName={rivalName}
              center
            />
          </Row>
          <Row nolimit>
            <TotalBallType
              matchId={matchId}
              playerName={playerName}
              rivalName={rivalName}
              set={targetSet}
            />
          </Row>
        </Wrapper>
        {
          targetSet !== process.env.REACT_APP_ALL_SET && (
            <Wrapper>
              <Row>
                <BlockTitle
                  id="graph-scoreTrend"
                  noPadding
                  instruction={(
                    <>
                      顯示該局比賽中，各個回合是由誰得分，而該回合共擊出了幾拍才得分
                      <br />
                      ※ 1分為1個回合
                    </>
                  )}
                >
                  {t('single.graph.scoreTrend.title')}
                </BlockTitle>
              </Row>
              <Row noPadding>
                <Legend
                  playerName={`${playerName} ${t('single.graph.scoreTrend.score')}`}
                  rivalName={`${rivalName} ${t('single.graph.scoreTrend.score')}`}
                  center
                />
              </Row>
              <Row nolimit>
                <LineChart
                  matchId={matchId}
                  playerName={playerName}
                  rivalName={rivalName}
                  set={targetSet}
                />
              </Row>
            </Wrapper>
          )
        }
      </div>
    );
  }
}

export default withTranslation()(Graph);
