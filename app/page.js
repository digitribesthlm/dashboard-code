'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [sortBy, setSortBy] = useState('creation_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeScoreFilter, setActiveScoreFilter] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;
  const [exactMatch, setExactMatch] = useState(false);

  // Memoize these functions to avoid recreation on every render
  const fetchBriefs = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Build the query parameters
      const params = [];
      
      // Get params from URL directly to ensure we have latest values
      const urlKeyword = searchParams.get('keyword');
      const urlExactMatch = searchParams.get('exactMatch') === 'true';
      
      if (urlKeyword) {
        params.push(`keyword=${encodeURIComponent(urlKeyword)}`);
        if (urlExactMatch) {
          params.push('exactMatch=true');
        }
      } else if (keyword) {
        params.push(`keyword=${encodeURIComponent(keyword)}`);
        if (exactMatch) {
          params.push('exactMatch=true');
        }
      }
      
      if (minScore) params.push(`minScore=${encodeURIComponent(minScore)}`);
      if (maxScore) params.push(`maxScore=${encodeURIComponent(maxScore)}`);
      
      // Only add domain filter if user is not admin or if domain filter is explicitly set
      const urlDomain = searchParams.get('domain');
      if (user && user.domain && user.role !== 'admin') {
        params.push(`domain=${encodeURIComponent(user.domain)}`);
      } else if (urlDomain) {
        params.push(`domain=${encodeURIComponent(urlDomain)}`);
      }
      
      const queryString = params.length > 0 ? `&${params.join('&')}` : '';
      const url = `/api/briefs?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${currentPage}&limit=${itemsPerPage}${queryString}`;
      
      console.log('Fetching briefs with URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setBriefs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching briefs:', err);
      setError('Failed to load content briefs. Please try again later.');
      setBriefs([]);
    } finally {
      setLoading(false);
    }
  }, [user, keyword, minScore, maxScore, exactMatch, sortBy, sortOrder, currentPage, itemsPerPage, searchParams]);

  const fetchTotalCount = useCallback(async () => {
    if (!user) return;
    
    try {
      // Build the query parameters
      const params = [];
      
      // Get params from URL directly to ensure we have latest values
      const urlKeyword = searchParams.get('keyword');
      const urlExactMatch = searchParams.get('exactMatch') === 'true';
      
      if (urlKeyword) {
        params.push(`keyword=${encodeURIComponent(urlKeyword)}`);
        if (urlExactMatch) {
          params.push('exactMatch=true');
        }
      } else if (keyword) {
        params.push(`keyword=${encodeURIComponent(keyword)}`);
        if (exactMatch) {
          params.push('exactMatch=true');
        }
      }
      
      if (minScore) params.push(`minScore=${encodeURIComponent(minScore)}`);
      if (maxScore) params.push(`maxScore=${encodeURIComponent(maxScore)}`);
      
      // Only add domain filter if user is not admin or if domain filter is explicitly set
      const urlDomain = searchParams.get('domain');
      if (user && user.domain && user.role !== 'admin') {
        params.push(`domain=${encodeURIComponent(user.domain)}`);
      } else if (urlDomain) {
        params.push(`domain=${encodeURIComponent(urlDomain)}`);
      }
      
      let url = '/api/briefs/count';
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      console.log('Fetching count with URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch count');
      }
      const data = await response.json();
      setTotalCount(data.count);
    } catch (err) {
      console.error('Error fetching total count:', err);
    }
  }, [user, keyword, minScore, maxScore, exactMatch, searchParams]);

  // Sync form state with URL parameters
  useEffect(() => {
    const urlKeyword = searchParams.get('keyword');
    const urlExactMatch = searchParams.get('exactMatch') === 'true';
    
    if (urlKeyword) {
      setKeyword(urlKeyword);
    }
    
    setExactMatch(urlExactMatch);
    
  }, [searchParams]);

  // Fetch data when user authentication is ready or when dependencies change
  useEffect(() => {
    if (user && !authLoading) {
      fetchBriefs();
      fetchTotalCount();
    }
  }, [user, authLoading, fetchBriefs, fetchTotalCount]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Update URL with search form values
    const params = new URLSearchParams();
    if (keyword) {
      params.set('keyword', keyword);
      if (exactMatch) {
        params.set('exactMatch', 'true');
      }
    }
    router.push(`/?${params.toString()}`);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
    setTimeout(fetchBriefs, 0);
  };

  const handleScoreFilter = (filter) => {
    // If clicking the already active filter, remove it
    if (filter === activeScoreFilter) {
      setActiveScoreFilter('');
      setMinScore('');
      setMaxScore('');
      setTimeout(() => {
        fetchBriefs();
        fetchTotalCount();
      }, 0);
    } else {
      // Set the filter first
      setActiveScoreFilter(filter);
      
      // Then update min/max scores
      let newMinScore = '';
      let newMaxScore = '';
      
      if (filter === 'opportunity') {
        newMinScore = '1';
        newMaxScore = '3';
      } else if (filter === 'average') {
        newMinScore = '4';
        newMaxScore = '6';
      } else if (filter === 'good') {
        newMinScore = '7';
        newMaxScore = '10';
      }
      
      // Update state with the new values
      setMinScore(newMinScore);
      setMaxScore(newMaxScore);
      setCurrentPage(1);
      
      setTimeout(() => {
        fetchBriefs();
        fetchTotalCount();
      }, 0);
    }
  };

  const handleClearFilters = () => {
    setKeyword('');
    setMinScore('');
    setMaxScore('');
    setActiveScoreFilter('');
    setExactMatch(false);
    setCurrentPage(1);
    
    // Clear URL parameters and navigate to home
    router.push('/');
  };

  const getScoreClass = (score) => {
    if (score <= 3) return 'score-poor';
    if (score <= 6) return 'score-average';
    return 'score-good';
  };

  const getScoreLabel = (score) => {
    if (score <= 3) return 'Opportunity';
    if (score <= 6) return 'Average';
    return 'Good';
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
    window.location.href = '/login';
    return null;
  }

  // Get URL params for display
  const urlKeyword = searchParams.get('keyword');
  const urlExactMatch = searchParams.get('exactMatch') === 'true';
  
  // Show active filters notification
  const hasActiveFilters = urlKeyword || (keyword && !urlKeyword) || minScore || maxScore || activeScoreFilter;
  
  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> / Content Briefs
        </div>
        <h1>Content Briefs {user && user.domain && <span>for {user.domain}</span>}</h1>
        {urlKeyword && (
          <div className="active-filter-notification">
            Showing briefs for keyword: <strong>{urlKeyword}</strong>
            {urlExactMatch && <span className="exact-match-indicator">(Exact match)</span>}
            <button 
              onClick={handleClearFilters}
              className="clear-filter-button"
            >
              Clear
            </button>
          </div>
        )}
        <div className="total-count">
          Total Content Briefs: <span className="count-number">{totalCount}</span>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Left sidebar for filters */}
        <div className="filter-sidebar">
          <div className="filter-box">
            <h2>Quick Filter by Score</h2>
            <div className="filter-buttons">
              <button 
                onClick={() => handleScoreFilter('opportunity')}
                className={`filter-button ${activeScoreFilter === 'opportunity' ? 'active opportunity' : ''}`}
              >
                Opportunity (1-3)
              </button>
              <button 
                onClick={() => handleScoreFilter('average')}
                className={`filter-button ${activeScoreFilter === 'average' ? 'active average' : ''}`}
              >
                Average (4-6)
              </button>
              <button 
                onClick={() => handleScoreFilter('good')}
                className={`filter-button ${activeScoreFilter === 'good' ? 'active good' : ''}`}
              >
                Good (7-10)
              </button>
            </div>
          </div>
          
          <div className="filter-box">
            <h2>Search Briefs</h2>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label htmlFor="keyword">Keyword</label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="form-control"
                  placeholder="e.g., SEO Content"
                />
              </div>
              <div className="form-group">
                <label htmlFor="score">Coverage Score</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    id="minScore"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="form-control"
                    placeholder="Min"
                    min="1"
                    max="10"
                  />
                  <input
                    type="number"
                    id="maxScore"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="form-control"
                    placeholder="Max"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="exactMatchCheck"
                    checked={exactMatch}
                    onChange={(e) => setExactMatch(e.target.checked)}
                  />
                  <label htmlFor="exactMatchCheck">Exact keyword match</label>
                </div>
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
              
              {hasActiveFilters && (
                <button 
                  type="button" 
                  onClick={handleClearFilters}
                  className="clear-button"
                >
                  Clear All Filters
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Main content area */}
        <div className="content-area">
          {/* Sort controls */}
          <div className="sort-controls">
            <span>Sort by:</span>
            <div className="sort-buttons">
              <button 
                onClick={() => handleSort('keyword')}
                className={`sort-button ${sortBy === 'keyword' ? 'active' : ''}`}
              >
                Keyword {sortBy === 'keyword' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => handleSort('coverage_score')}
                className={`sort-button ${sortBy === 'coverage_score' ? 'active' : ''}`}
              >
                Coverage Score {sortBy === 'coverage_score' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => handleSort('creation_date')}
                className={`sort-button ${sortBy === 'creation_date' ? 'active' : ''}`}
              >
                Date {sortBy === 'creation_date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Loading State */}
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading content briefs...</p>
            </div>
          ) : (
            <>
              {/* Results Count & Pagination */}
              <div className="results-header">
                <div className="results-count">
                  Showing {briefs.length} of {totalCount} content briefs
                </div>
                <div className="pagination">
                  <button 
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  <span className="page-indicator">Page {currentPage}</span>
                  <button 
                    onClick={() => {
                      if (briefs.length >= itemsPerPage) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                    disabled={briefs.length < itemsPerPage}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Content Briefs Grid */}
              {briefs.length > 0 ? (
                <div className="briefs-grid">
                  {briefs.map((brief) => (
                    <div key={brief.brief_id} className="brief-card">
                      <div className="brief-header">
                        <Link href={`/brief/${brief.brief_id}`} className="brief-title">
                          {brief.keyword}
                        </Link>
                        <div className={`score-badge ${getScoreClass(brief.coverage_score)}`}>
                          {brief.coverage_score}/10
                          <span className="score-label">
                            {getScoreLabel(brief.coverage_score)}
                          </span>
                        </div>
                      </div>
                      <div className="brief-date">
                        {new Date(brief.creation_date).toLocaleDateString()}
                      </div>
                      <p className="brief-description">
                        {brief.meta_description}
                      </p>
                      <div className="brief-meta">
                        {brief.content_type && (
                          <span className="meta-tag content-type">{brief.content_type}</span>
                        )}
                        {brief.content_status && (
                          <span className="meta-tag content-status">{brief.content_status}</span>
                        )}
                        {brief.target_word_count && (
                          <span className="meta-tag word-count">{brief.target_word_count} words</span>
                        )}
                        {brief.domain && (
                          <span className="meta-tag domain">{brief.domain}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>No content briefs found matching your criteria.</p>
                  <button 
                    onClick={handleClearFilters}
                    className="reset-button"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
