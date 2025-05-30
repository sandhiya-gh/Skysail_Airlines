import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Plane, Calendar, Users, ArrowLeftRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addMonths } from 'date-fns';
import StepFlow from './StepFlow';
import axios from 'axios';

const PageContainer = styled.div`
  min-height: calc(100vh - 64px);
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
  padding-bottom: 100px; /* Ensure space for footer */
`;

const SearchCard = styled.div`
  background: ${props => props.theme.colors.white || '#ffffff'};
  border-radius: 1rem;
  box-shadow: ${props => props.theme.shadows.lg || '0 4px 6px rgba(0, 0, 0, 0.1)'};
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  position: relative;
  border: 1px solid ${props => props.theme.colors.gray?.[400] || '#d1d5db'};
`;

const Title = styled.h1`
  color: #1A365D;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const TripTypeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;
`;

const ToggleButton = styled.button`
  padding: 0.75rem 1.25rem;
  border: 2px solid ${props => props.theme.colors.gray?.[300] || '#d1d5db'};
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  background-color: ${props => (props.active ? '#1A365D' : props.theme.colors.white || '#ffffff')};
  color: ${props => (props.active ? '#ffffff' : props.theme.colors.gray?.[700] || '#4b5563')};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background-color: ${props => props.active ? '#1A365D' : props.theme.colors.gray?.[100] || '#f5f5f5'};
    color: ${props => props.active ? '#ffffff' : props.theme.colors.gray?.[700] || '#4b5563'};
  }

  &:focus {
    outline: none;
    border-color: #1A365D;
    box-shadow: 0 0 0 2px rgba(26, 54, 93, 0.2);
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
  @media (min-width: ${props => props.theme.breakpoints.md || '768px'}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative; /* For positioning suggestions */
`;

const Label = styled.label`
  color: ${props => props.theme.colors.gray?.[700] || '#4b5563'};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray?.[300] || '#d1d5db'};
  border-radius: 0.5rem;
  font-size: 1rem;
  width: 100%;
  background-color: #f5f5f5;
  &:focus {
    outline: none;
    border-color: #1A365D;
    box-shadow: 0 0 0 2px rgba(26, 54, 93, 0.2);
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.white || '#ffffff'};
  border: 1px solid ${props => props.theme.colors.gray?.[300] || '#d1d5db'};
  border-radius: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  &:hover {
    background-color: ${props => props.theme.colors.gray?.[100] || '#f5f5f5'};
  }
`;

const DatePickerContainer = styled.div`
  position: relative;
`;

const DateInput = styled(Input)`
  cursor: pointer;
`;

const CalendarOverlay = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  background-color: white;
  box-shadow: ${props => props.theme.shadows.md || '0 4px 6px rgba(0, 0, 0, 0.1)'};
  border-radius: 0.5rem;
  overflow: hidden;
`;

const SwitchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.colors.gray?.[300] || '#d1d5db'};
  border-radius: 0.5rem;
  background-color: ${props => props.theme.colors.white || '#ffffff'};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  align-self: flex-end;
  margin-bottom: 0.5rem;

  &:hover {
    background-color: ${props => props.theme.colors.gray?.[100] || '#f5f5f5'};
  }

  &:focus {
    outline: none;
    border-color: #1A365D;
    box-shadow: 0 0 0 2px rgba(26, 54, 93, 0.2);
  }
`;

const AirportFieldsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  grid-column: 1 / -1;
`;

const Button = styled.button`
  background: #1A365D;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  width: 100%;
  grid-column: 1 / -1;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
`;

const FlightSearchForm = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('one-way');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: null,
    returnDate: null,
    passengers: '1',
    class: 'economy'
  });
  const [airports, setAirports] = useState([]);
  const [filteredFromAirports, setFilteredFromAirports] = useState([]);
  const [filteredToAirports, setFilteredToAirports] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [airportError, setAirportError] = useState('');
  const today = new Date();
  const maxDate = addMonths(today, 3);

  useEffect(() => {
    axios.get('http://localhost:5000/api/airports')
      .then(response => {
        setAirports(response.data);
      })
      .catch(error => {
        console.error('Error fetching airports:', error);
      });
  }, []);

  const handleTripTypeChange = (type) => {
    setTripType(type);
    setFormData(prev => ({
      ...prev,
      returnDate: type === 'one-way' ? null : prev.returnDate,
    }));
    setShowReturnPicker(false);
    setAirportError('');
  };

  const handleSwitchAirports = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
    setAirportError('');
    setShowFromSuggestions(false);
    setShowToSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.from.trim().toLowerCase() === formData.to.trim().toLowerCase()) {
      setAirportError('Departure and arrival airports cannot be the same.');
      return;
    }
    setAirportError('');

    const formattedData = {
      ...formData,
      departureDate: formData.departureDate ? formData.departureDate.toLocaleDateString('en-US') : '',
      returnDate: formData.returnDate ? formData.returnDate.toLocaleDateString('en-US') : '',
      tripType,
    };
    navigate('/search-results', { state: formattedData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (airportError && (name === 'from' || name === 'to')) {
      setAirportError('');
    }

    if (name === 'from') {
      const filtered = airports.filter(airport =>
        airport.code.toLowerCase().startsWith(value.toLowerCase()) ||
        airport.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredFromAirports(filtered);
      setShowFromSuggestions(value.length > 0);
    } else if (name === 'to') {
      const filtered = airports.filter(airport =>
        airport.code.toLowerCase().startsWith(value.toLowerCase()) ||
        airport.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredToAirports(filtered);
      setShowToSuggestions(value.length > 0);
    }
  };

  const handleSelectAirport = (name, airport) => {
    setFormData(prev => ({
      ...prev,
      [name]: airport.code
    }));
    if (name === 'from') {
      setShowFromSuggestions(false);
    } else {
      setShowToSuggestions(false);
    }
    if (airportError) {
      setAirportError('');
    }
  };

  const handleDepartureDateChange = (date) => {
    setFormData(prev => ({ ...prev, departureDate: date }));
    setShowDeparturePicker(false);
    if (formData.returnDate && date > formData.returnDate) {
      setFormData(prev => ({ ...prev, returnDate: null }));
    }
  };

  const handleReturnDateChange = (date) => {
    setFormData(prev => ({ ...prev, returnDate: date }));
    setShowReturnPicker(false);
  };

  return (
    <PageContainer>
      <StepFlow currentStep={1} />
      <SearchCard>
        <Title>Find Your Perfect Flight</Title>

        <TripTypeToggle>
          <ToggleButton
            type="button"
            active={tripType === 'one-way'}
            onClick={() => handleTripTypeChange('one-way')}
          >
            One Way
          </ToggleButton>
          <ToggleButton
            type="button"
            active={tripType === 'round-trip'}
            onClick={() => handleTripTypeChange('round-trip')}
          >
            Round Trip
          </ToggleButton>
        </TripTypeToggle>

        <Form onSubmit={handleSubmit}>
          <AirportFieldsContainer>
            <FormGroup style={{ flex: 1 }}>
              <Label><Plane size={18} /> From</Label>
              <Input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="Enter departure airport"
                required
                autoComplete="off"
              />
              {showFromSuggestions && filteredFromAirports.length > 0 && (
                <SuggestionsList>
                  {filteredFromAirports.map(airport => (
                    <SuggestionItem
                      key={airport.code}
                      onClick={() => handleSelectAirport('from', airport)}
                    >
                      {airport.code} - {airport.name}
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              )}
            </FormGroup>
            <SwitchButton type="button" onClick={handleSwitchAirports}>
              <ArrowLeftRight size={18} />
            </SwitchButton>
            <FormGroup style={{ flex: 1 }}>
              <Label><Plane size={18} /> To</Label>
              <Input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="Enter arrival airport"
                required
                autoComplete="off"
              />
              {showToSuggestions && filteredToAirports.length > 0 && (
                <SuggestionsList>
                  {filteredToAirports.map(airport => (
                    <SuggestionItem
                      key={airport.code}
                      onClick={() => handleSelectAirport('to', airport)}
                    >
                      {airport.code} - {airport.name}
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              )}
            </FormGroup>
          </AirportFieldsContainer>
          {airportError && <p style={{ color: 'red', gridColumn: '1 / -1', marginBottom: '0' }}>{airportError}</p>}
          <FormGroup>
            <Label><Calendar size={18} /> Departure Date</Label>
            <DatePickerContainer>
              <DateInput
                type="text"
                value={formData.departureDate ? formData.departureDate.toLocaleDateString() : 'mm/dd/yyyy'}
                onClick={() => setShowDeparturePicker(!showDeparturePicker)}
                readOnly
              />
              {showDeparturePicker && (
                <CalendarOverlay>
                  <DatePicker
                    selected={formData.departureDate}
                    onChange={handleDepartureDateChange}
                    minDate={today}
                    maxDate={maxDate}
                    dateFormat="MM/dd/yyyy"
                    inline
                  />
                </CalendarOverlay>
              )}
            </DatePickerContainer>
          </FormGroup>
          {tripType === 'round-trip' && (
            <FormGroup>
              <Label><Calendar size={18} /> Return Date</Label>
              <DatePickerContainer>
                <DateInput
                  type="text"
                  value={formData.returnDate ? formData.returnDate.toLocaleDateString() : 'mm/dd/yyyy'}
                  onClick={() => setShowReturnPicker(!showReturnPicker)}
                  readOnly
                />
                {showReturnPicker && (
                  <CalendarOverlay>
                    <DatePicker
                      selected={formData.returnDate}
                      onChange={handleReturnDateChange}
                      minDate={formData.departureDate || today}
                      maxDate={maxDate}
                      dateFormat="MM/dd/yyyy"
                      inline
                    />
                  </CalendarOverlay>
                )}
              </DatePickerContainer>
            </FormGroup>
          )}
          <FormGroup>
            <Label><Users size={18} /> Passengers</Label>
            <select
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                width: '100%',
                backgroundColor: '#f5f5f5',
                height: '2.5rem'
              }}
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </FormGroup>
          <FormGroup>
            <Label><Plane size={18} /> Class</Label>
            <select
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                width: '100%',
                backgroundColor: '#f5f5f5',
                height: '2.5rem'
              }}
              name="class"
              value={formData.class}
              onChange={handleChange}
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </select>
          </FormGroup>
          <Button type="submit">Search Flights</Button>
        </Form>
      </SearchCard>
    </PageContainer>
  );
};

export default FlightSearchForm;