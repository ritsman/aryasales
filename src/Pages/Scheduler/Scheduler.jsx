import React from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  ViewsDirective, ViewDirective 
} from "@syncfusion/ej2-react-schedule";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-schedule/styles/material.css";

function Schedular() {
  // Sample data with two objects having the same date range
  const data = [
    {
      Id: 1,
      Subject: 'Cutting',
      StartTime: new Date('2025-03-18'),
      EndTime: new Date('2025-03-21'),
      WO: '234345',
      Status: 50,
      IsAllDay: true,
      CategoryColor: '#1aaa55'
    },
    {
      Id: 2,
      Subject: 'Sewing',
      StartTime: new Date('2025-03-18'),
      EndTime: new Date('2025-03-20'),
      WO: '234346',
      Status: 30,
      IsAllDay: true,
      CategoryColor: '#357cd2'
    }
  ];

  // Custom event template to render progress bar
  const eventTemplate = (props) => {
    return (
      <div className="template-wrap" style={{width: '100%', height: '100%', position: 'relative'}}>
        <div className="event-header" style={{fontWeight: 'bold', padding: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {props.Subject} - WO: {props.WO}
        </div>
        <div className="progress-container" style={{width: '100%', height: '8px', backgroundColor: '#e0e0e0', marginTop: '2px'}}>
          <div className="progress-bar" style={{
            width: `${props.Status}%`, 
            height: '100%', 
            backgroundColor: props.CategoryColor
          }}></div>
        </div>
        <div className="status-text" style={{fontSize: '11px', marginTop: '2px'}}>
          Status: {props.Status}%
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <h2>Work Order Scheduler</h2>
      <ScheduleComponent 
        height='650px' 
        width='100%'
        eventSettings={{ 
          dataSource: data,
          template: eventTemplate,
          enableTooltip: true
        }}
        rowAutoHeight={true} // Adjusts row height to fit all events
        cssClass="work-order-scheduler"
      >
        <ViewsDirective>
          <ViewDirective option='Day' />
          <ViewDirective option='Week' />
          <ViewDirective option='WorkWeek' />
          <ViewDirective option='Month' />
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month]} />
      </ScheduleComponent>
    </div>
  );
}


export default Schedular;
