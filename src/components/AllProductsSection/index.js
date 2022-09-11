import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'

import FiltersGroup from '../FiltersGroup'
import ProductCard from '../ProductCard'
import ProductsHeader from '../ProductsHeader'

import './index.css'

const categoryOptions = [
  {
    name: 'Clothing',
    categoryId: '1',
  },
  {
    name: 'Electronics',
    categoryId: '2',
  },
  {
    name: 'Appliances',
    categoryId: '3',
  },
  {
    name: 'Grocery',
    categoryId: '4',
  },
  {
    name: 'Toys',
    categoryId: '5',
  },
]

const sortbyOptions = [
  {
    optionId: 'PRICE_HIGH',
    displayText: 'Price (High-Low)',
  },
  {
    optionId: 'PRICE_LOW',
    displayText: 'Price (Low-High)',
  },
]

const ratingsList = [
  {
    ratingId: '4',
    imageUrl:
      'https://assets.ccbp.in/frontend/react-js/rating-four-stars-img.png',
  },
  {
    ratingId: '3',
    imageUrl:
      'https://assets.ccbp.in/frontend/react-js/rating-three-stars-img.png',
  },
  {
    ratingId: '2',
    imageUrl:
      'https://assets.ccbp.in/frontend/react-js/rating-two-stars-img.png',
  },
  {
    ratingId: '1',
    imageUrl:
      'https://assets.ccbp.in/frontend/react-js/rating-one-star-img.png',
  },
]

const apiStatusList = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failed: 'FAILED',
  inProgress: 'IN_PROGRESS',
  noProducts: 'NO_PRODUCTS',
}

class AllProductsSection extends Component {
  state = {
    productsList: [],
    apiStatus: apiStatusList.initial,
    activeOptionId: sortbyOptions[0].optionId,
    searchInput: '',
    categoryID: '',
    ratingID: '',
  }

  componentDidMount() {
    this.getProducts()
  }

  updateSearchInput = searchInput => {
    this.setState({searchInput}, this.getProducts)
  }

  updateCategoryID = category => {
    const requiredOption = categoryOptions.filter(
      each => each.name === category,
    )
    this.setState({categoryID: requiredOption[0].categoryId}, this.getProducts)
  }

  updateratingID = rating => {
    const requiredOption = ratingsList.filter(each => each.imageUrl === rating)
    this.setState({ratingID: requiredOption[0].ratingId}, this.getProducts)
  }

  changeSortby = activeOptionId => {
    this.setState({activeOptionId}, this.getProducts)
  }

  resetFilters = () => {
    this.setState(
      {
        productsList: [],
        apiStatus: apiStatusList.initial,
        activeOptionId: sortbyOptions[0].optionId,
        searchInput: '',
        categoryID: '',
        ratingID: '',
      },
      this.getProducts,
    )
  }

  getProducts = async () => {
    this.setState({
      apiStatus: apiStatusList.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')

    // TODO: Update the code to get products with filters applied

    const {activeOptionId, searchInput, categoryID, ratingID} = this.state
    const apiUrl = `https://apis.ccbp.in/products?sort_by=${activeOptionId}&category=${categoryID}&title_search=${searchInput}&rating=${ratingID}`
    console.log(apiUrl)
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    console.log(response)
    if (response.ok) {
      const fetchedData = await response.json()
      console.log('Length of Fetched Data', fetchedData.products.length)
      if (fetchedData.products.length !== 0) {
        const updatedData = fetchedData.products.map(product => ({
          title: product.title,
          brand: product.brand,
          price: product.price,
          id: product.id,
          imageUrl: product.image_url,
          rating: product.rating,
        }))
        console.log('Fetched data', fetchedData)
        this.setState({
          productsList: updatedData,
          apiStatus: apiStatusList.success,
        })
      } else {
        console.log('No Products with this filter')
        this.setState({apiStatus: apiStatusList.noProducts})
      }
    } else {
      console.log('Loading failed')
      this.setState({apiStatus: apiStatusList.failed})
    }
  }

  noProductsView = () => {
    console.log('Entering No Products View')
    return (
      <div className="no-products-container">
        <img
          className="no-products-image"
          src="https://assets.ccbp.in/frontend/react-js/nxt-trendz/nxt-trendz-no-products-view.png"
          alt="no products"
        />
        <h1 className="no-products-heading">No Products Found</h1>
        <p className="no-products-description">
          We could not find any products. Try other filters
        </p>
      </div>
    )
  }

  renderProductsList = () => {
    const {productsList, activeOptionId} = this.state
    // TODO: Add No Products View
    return (
      <div className="all-products-container">
        <ProductsHeader
          activeOptionId={activeOptionId}
          sortbyOptions={sortbyOptions}
          changeSortby={this.changeSortby}
        />
        <ul className="products-list">
          {productsList.map(product => (
            <ProductCard productData={product} key={product.id} />
          ))}
        </ul>
      </div>
    )
  }

  renderLoader = () => (
    <div className="products-loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  loadFailureView = () => (
    <div className="failure-view">
      <img
        className="failure-view-image"
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz/nxt-trendz-products-error-view.png"
        alt="products failure"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-description">
        We are having some trouble processing your request. Please try again
      </p>
    </div>
  )

  renderContainerDecider = () => {
    console.log('Entering Decision Container')
    const {apiStatus} = this.state
    console.log('API STATUS NOW:', apiStatus)

    switch (apiStatus) {
      case apiStatusList.success:
        return this.renderProductsList()
      case apiStatusList.failed:
        return this.loadFailureView()
      case apiStatusList.inProgress:
        return this.renderLoader()
      case apiStatusList.noProducts:
        return this.noProductsView()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="all-products-section">
        {/* TODO: Update the below element */}
        <FiltersGroup
          categoryOptions={categoryOptions}
          ratingsList={ratingsList}
          updateCategoryID={this.updateCategoryID}
          updateratingID={this.updateratingID}
          updateSearchInput={this.updateSearchInput}
          resetFilters={this.resetFilters}
        />
        {this.renderContainerDecider()}
      </div>
    )
  }
}

export default AllProductsSection
