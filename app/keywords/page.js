'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AuthHeader from '../components/AuthHeader';
import Navigation from '../components/Navigation';

export default function KeywordsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'keyword', direction: 'asc' });
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  
  useEffect(() => {
    // Only fetch keywords if user is authenticated
    if (user && !authLoading) {
      fetchKeywords();
    }
  }, [user, authLoading]);
  
  useEffect(() => {
    // Filter and sort keywords when data or search term changes
    const filtered = keywords.filter(keyword => 
      keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === 'keyword') {
        return sortConfig.direction === 'asc' 
          ? a.keyword.localeCompare(b.keyword)
          : b.keyword.localeCompare(a.keyword);
      } else if (sortConfig.key === 'count') {
        return sortConfig.direction === 'asc' 
          ? a.count - b.count 
          : b.count - a.count;
      }
      return 0;
    });
    
    setFilteredKeywords(sorted);
  }, [keywords, searchTerm, sortConfig]);
  
  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/keywords/count');
      
      if (!response.ok) {
        throw new Error('Failed to fetch keywords');
      }
      
      const data = await response.json();
      setKeywords(data);
    } catch (err) {
      console.error('Error fetching keywords:', err);
      setError('Failed to load keywords. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return { 
          key, 
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' 
        };
      }
      return { key, direction: 'asc' };
    });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleKeywordClick = (keyword) => {
    // Navigate to main page with this keyword as a filter
    router.push(`/?keyword=${encodeURIComponent(keyword)}`);
  };
  
  // If auth is still loading, show a loading indicator
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }
  
  return (
    <div className="dashboard-container">
      <AuthHeader />
      <Navigation />
      <div className="page-header">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> / Keywords
        </div>
        <h1>Keywords Overview</h1>
      </div>
      
      <div className="search-and-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={handleSearch}
            className="form-control"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading keywords...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredKeywords.length === 0 ? (
        <div className="no-results">
          <p>No keywords found.</p>
        </div>
      ) : (
        <div className="keywords-table-container">
          <table className="keywords-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('keyword')}>
                  Keyword {getSortIcon('keyword')}
                </th>
                <th onClick={() => handleSort('count')}>
                  Brief Count {getSortIcon('count')}
                </th>
                <th>Domains</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map((item, index) => (
                <tr key={index} onClick={() => handleKeywordClick(item.keyword)}>
                  <td>{item.keyword}</td>
                  <td className="count-cell">{item.count}</td>
                  <td className="domains-cell">
                    {item.domains.map((domain, i) => (
                      <span key={i} className="domain-tag">{domain}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 