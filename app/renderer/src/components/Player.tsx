import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { default as PlayerBar } from './PlayBar';
import { HorenContext } from '../App';
import { readCoverSource } from '../api';

const PLAYER = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: #555;
  transition: top 0.25s ease-in-out;
  z-index: 999;
`;

const PlayBar = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

const Cover = styled.div`
  display: flex;
  width: 50%;
  height: calc(100vh - 64px);
  padding: 16px 16px 32px 32px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  .frame {
    width: 80%;
  }
`;

const Picture = styled.div`
  width: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Lyric = styled.div`
  display: flex;
  width: 50%;
  height: calc(100vh - 64px);
  padding: 16px 32px 64px 16px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const TrackInfo = styled.div`
  width: 100%;
  padding: 0 4px;
  .title {
    font-size: 1.2rem;
    color: #e0e0e0;
  }
  .artist {
    font-size: 0.8rem;
    color: #aeaeae;
  }
`;

const LyricText = styled.div`
  height: calc(100% - 64px);
  width: 100%;
`;

export type PlayerProps = {};

export default function Player(props: PlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const [cover, setCover] = useState('');
  const top = !expanded ? 'calc(100vh - 64px)' : '0';
  const { player } = useContext(HorenContext);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (player.currentTrack?.album) {
      readCoverSource(player.currentTrack.album).then(setCover);
    }
  }, [player.currentTrack]);

  return (
    <PLAYER className="player" style={{ top }}>
      <PlayBar>
        <PlayerBar onExpand={handleClick} visible={!expanded} />
      </PlayBar>
      <div style={{ display: 'flex', padding: '0 32px' }}>
        <Cover className="player-cover">
          <div className="frame">
            <Picture>
              <img src={cover} alt={player.currentTrack?.title} />
            </Picture>
          </div>
        </Cover>
        <Lyric className="player-lyric">
          <TrackInfo>
            <div className="title">{player.currentTrack?.title}</div>
            <div className="artist">{player.currentTrack?.artist}</div>
          </TrackInfo>
          <LyricText />
        </Lyric>
      </div>
    </PLAYER>
  );
}
