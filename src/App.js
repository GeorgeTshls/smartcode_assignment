import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { useRef, useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { differenceInDays } from 'date-fns';
import moment from 'moment/moment';
import axios from 'axios';

function App() {

  const [users, setUsers] = useState([]);
  const [nights, setNights] = useState(0);
  const [name, setName] = useState('');
  const [selection, setSelection] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [resetKey, setResetKey] = useState(Math.random());


  const calendarRef = useRef(null);


  function Header() {
    return (
      <div className='header_cont'>
        <p className='header_title'>Reservations</p>
        <FontAwesomeIcon icon={faSquarePlus} className='plus_icon' onClick={() => handleCalendar()} />
      </div>
    )
  }

  const UserList = ({ users }) => {

    function handleDelete(user) {
      const updatedUsers = users.filter((u) => u.email !== user.email);
      setUsers(updatedUsers);
    }

    return (
      <ul className='userlist_cont' id='userlist'>
        {users && users?.length > 0 && users?.map(user => (
          <li key={user?.email}>
            <div>
              <p className='userlist_text'>{user.name}</p>
              <p className='userlist_text'>{user.email}</p>
              <p className='userlist_text'>{'Check-In: ' + moment(user?.checkin).format('DD/MM/YYYY')}</p>
              <p className='userlist_text'>{'Check-Out: ' + moment(user?.checkout).format('DD/MM/YYYY')}</p>
            </div>

            <FontAwesomeIcon icon={faTrashAlt} className='trash_icon' onClick={() => handleDelete(user)} />
          </li>
        ))}
      </ul>
    )
  }

  function handleCalendar() {
    document.getElementById('main').style.opacity = 0;
    document.getElementById('calendar_cont').style.opacity = 1;
  }

  function closeCalendar() {
    document.getElementById('main').style.opacity = 1;
    document.getElementById('calendar_cont').style.opacity = 0;
    setName('');
    setSelection({
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    });
    setNights(0);
    setResetKey(Math.random())
  }

  function addUser() {
    let check = true;
    users?.forEach((usr) => {
      if (usr?.checkout !== usr?.checkin) {
        if (moment(selection?.endDate).isBetween(moment(usr?.checkin), moment(usr?.checkout)) || moment(selection?.startDate).isBetween(moment(usr?.checkin), moment(usr?.checkout))) {
          check = false;
        } else {
          if (moment(selection?.startDate).isBetween(moment(usr?.checkin), moment(usr?.checkout))) {
            check = false;
          }
        }
      }
    })

    if (!check) {
      window.alert('There are already bookings on the selected dates!')
      return;
    }

    if (name !== '' && nights > 0) {
      axios.get('https://randomuser.me/api/?results=1')
        .then((response) => {
          let arr = users;
          arr.push({
            name: name,
            checkout: selection.endDate,
            checkin: selection.startDate,
            email: response.data.results[0]?.email,
          });
          setUsers(arr);
          closeCalendar();
        })
        .catch((error) => {
          window.alert(error.message);
          closeCalendar();
        });

    } else {
      window.alert('You need to enter a name & a date')
    }
  }

  const handleSelect = (ranges) => {
    const { selection } = ranges;
    if (selection) {
      setSelection(selection);
      const days = differenceInDays(selection.endDate, selection.startDate) + 1;
      setNights(days);
    };
  }


  return (
    <div className="App">
      <div id='main'>
        <Header />
        <UserList users={users} />
      </div>
      <div id='calendar_cont'>
        <p className='header_title'>Add reservation</p>
        <div className='row_cont input_cont'>
          <p>Name</p>
          <input onChange={(e) => setName(e.target.value)} value={name}></input>
        </div>
        <DateRange
          ranges={[selection]}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          editableDateInputs={true}
          months={1}
          direction='horizontal'
          showDateDisplay={false}
          showMonthAndYearPickers={false}
          ref={calendarRef}
          key={resetKey}
        />
        <div className='row_cont'>
          <p>Nights</p>
          <p id='nights'>{nights}</p>
        </div>

        <div className='row_cont'>
          <button onClick={() => addUser()} style={{ backgroundColor: '#69dbdb' }}>Add</button>
          <button onClick={() => closeCalendar()}>Cancel</button>
        </div>
      </div>

    </div>
  );
}

export default App;
