import React from 'react';
import { Menu, Image, Icon, Header } from 'semantic-ui-react';
import moment from 'moment';

const WeekendEvent = props => (
  <Menu.Item>
    {props.event.name.text}<div>{moment(props.event.start.local).calendar()}</div>
  </Menu.Item>
);


export default WeekendEvent;
