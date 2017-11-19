import React from 'react';
import categories from '../../../categories.json';

const EventEntry = (props) => {
	let imageUrl = props.event.logo ? props.event.logo.url : 'https://cdn.evbstatic.com/s3-build/perm_001/f8c5fa/django/images/discovery/default_logos/4.png';
	let getCatagory = (id) => {
		for (let category of categories.categories) {
			if (category.id === id) {
				return category.name;
			}
		}
	};


	return (
		<div>
			<a href={props.event.url}>
				<div className="eventImage">
					<img className="image" src={imageUrl}/>
				</div>
				<div className="eventBody">
					<time className="eventTime">{props.event.start.local}</time>
					<div className="eventTitle">{props.event.name.text}</div>
					<div className="eventLocation"></div>
					<div className="event">{props.event.is_free ? 'Free' : 'FEE'}</div>
					<div className="eventCategory">{getCatagory(props.event.category_id)}</div>
				</div>
			</a>
		</div>
	)
};

export default EventEntry;