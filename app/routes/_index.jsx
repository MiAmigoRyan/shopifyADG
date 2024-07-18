import {defer} from '@shopify/remix-oxygen';
import {
  Await,
  useLoaderData,
  Link,
  Form,
  useActionData,
  useFetcher
} from '@remix-run/react';
import {Suspense, useState} from 'react';
import {CartForm, Image, Money} from '@shopify/hydrogen';
import {addressValid} from '../assets/testAddresses';
import {json} from '@shopify/remix-oxygen';


/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  return defer({});
}

export const action = async ({request, context}) => {
  const formData = await request.formData();
  const inputAddress = formData.get('address');
  console.log('input address :', inputAddress);

  // Find the full address that includes the input address
  const addressExists = addressValid.find(
    (addr) => addr.toLowerCase() === inputAddress.toLowerCase(),
  );
  console.log('address exists : ', addressExists);

  if (addressExists) {
    // Extract the state name from the full address
    const stateName = addressExists.split(', ')[2];
    console.log('Extracted state name:', stateName); // Log the state name

    try {
      //fetch collection by state name
      const collectionResponse = await context.storefront.query(
        FEATURED_COLLECTION_QUERY,
        {variables: {title: stateName}},
      );
      console.log(
        'collectionResponse response ',
        JSON.stringify(collectionResponse, null, 2),
      );

    
      return json({
        collection: collectionResponse,
        addressValid: true,
      });
    } catch (error) {
      console.error('ERROR FETCHING DATA', error);
      return json({addressValid: false});
    }
  } else {
    return json({addressValid: false});
  }
};



export default function Homepage() {
  const actionData = useActionData(); //Get data from action
  const [address, setAddress] = useState(''); //State for address input
  const fetcher = useFetcher();// fetcher used for form submission

  // address input change
  const handleInput = (event) => {
    setAddress(event.target.value);
  }

  //add to cart and redirect to /cart page
  const handleAddToCart = (productId) => {
    fetcher.submit(
      {
        action: CartForm.ACTIONS.LinesAdd, // add lines to cart
        'lines[0]': '1', // limit to one quantity of item
        'lines[0][merchandiseId]': productId, 
        redirectTo: '/cart',
      },
      { method: 'post', action: '/cart' }
    );
  }
  
  console.log('Action Data:', actionData); 
  
  return (
    <div className="homeSearch">
      <Form method="POST">
        <label htmlFor="address">ENTER ADDRESS</label>
        <input
          type="text"
          id="address"
          name="address"
          value={address}
          onChange={handleInput}
        />
        <button type="submit">Show Offers</button>
      </Form>

      {actionData && (
        <div>
          {actionData.addressValid ? (
            actionData.collection ? (
              <div>
                <h2>{actionData.collection.collections.nodes[0].title}</h2>
                <div style={{ display: 'flex', overflowX: 'auto' }}>
                  {actionData.collection.collections.nodes[0].products.edges.map(({ node }) => (
                    <div 
                      key={node.id} 
                      style={{ flex: '0 0 auto', marginRight: '20px' }}
                      onClick={()=> handleAddToCart(node.id)}
                    >
                      {
                      <img 
                        src= {node.images.edges[0].node.url} 
                        alt={node.images.edges[0].node.altText}
                        style={{ width:'300px', height:'auto'}}/>
                      }
                      <h3>{node.title}</h3>
                      {/* <p>{node.priceRange.minVariantPrice.amount} {node.priceRange.minVariantPrice.currencyCode}</p> */}
                    </div>
                  ))}
                  </div>
              </div>
            ) : (
              <p>Loading collection...</p>
            )
          ) : (
            <p>Sorry, no fiber for you</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * @param {{
 *   AddressSearchForm;
 * }}
 */

<Form>Address Search</Form>;



/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}


const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
    products(first:5) {
      edges {
        node {
          id
        	title
					images(first:1){
            edges{
              node{
                url
                altText
                id
              }
            }
          }
        }
      }
    }
  }

  query FeaturedCollection($title: String!) {
    collections(first: 1, query: $title) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;



/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */


// G R A V E Y A R D 


// /**
//  * Load data necessary for rendering content above the fold. This is the critical data
//  * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
// //  * @param {LoaderFunctionArgs}
// //  */
// // async function loadCriticalData({context}) {
// //   const [{collections}] = await Promise.all([
// //     //context.storefront.query(FEATURED_COLLECTION_QUERY)
// //     //,
// //     ///
// //     //context.storefront.query(LOAD_ALL_COLLECTIONS_QUERY),
// //     ///
// //     // Add other queries here, so that they are loaded in parallel
// //   ]);

// //   return {
// //    // featuredCollection: collections.nodes[0],
// //    };
// // }

// /**
//  * Load data for rendering content below the fold. This data is deferred and will be
//  * fetched after the initial page load. If it's unavailable, the page should still 200.
//  * Make sure to not throw any errors here, as it will cause the page to 500.
//  * @param {LoaderFunctionArgs}
//  */
// function loadDeferredData({context}) {
//   const recommendedProducts = context.storefront
//     .query(RECOMMENDED_PRODUCTS_QUERY)
//     .catch((error) => {
//       // Log query errors, but don't throw them so the page can still render
//       console.error(error);
//       return null;
//     });

//   return {
//     recommendedProducts,
//   };
// }

// const RECOMMENDED_PRODUCTS_QUERY = `#graphql
//   fragment RecommendedProduct on Product {
//     id
//     title
//     handle
//     priceRange {
//       minVariantPrice {
//         amount
//         currencyCode
//       }
//     }
//     images(first: 1) {
//       nodes {
//         id
//         url
//         altText
//         width
//         height
//       }
//     }
//   }
//   query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
//     @inContext(country: $country, language: $language) {
//     products(first: 4, sortKey: UPDATED_AT, reverse: true) {
//       nodes {
//         ...RecommendedProduct
//       }
//     }
//   }
// `;

// /**
//  * @param {{
//  *   products: Promise<RecommendedProductsQuery | null>;
//  * }}
//  */
// function RecommendedProducts({products}) {
//   return (
//     <div className="recommended-products">
//       <h2>Available Offers</h2>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Await resolve={products}>
//           {(response) => (
//             <div className="recommended-products-grid">
//               {response
//                 ? response.products.nodes.map((product) => (
//                     <Link
//                       key={product.id}
//                       className="recommended-product"
//                       to={`/products/${product.handle}`}
//                     >
//                       {/* <Image
//                         data={product.images.nodes[0]}
//                         aspectRatio="1/1"
//                         sizes="(min-width: 45em) 20vw, 50vw"
//                       /> */}
//                       <h4>{product.title}</h4>
//                       <small>
//                         <Money data={product.priceRange.minVariantPrice} />
//                       </small>
//                       <small>{product.id}</small>
//                     </Link>
//                   ))
//                 : null}
//             </div>
//           )}
//         </Await>
//       </Suspense>
//       <br />
//     </div>
//   );
// }


// async function fetchAllCollections(context) {
//   let allCollections = [];
//   let hasNextPage = true;
//   let cursor = null;

//   while (hasNextPage) {
//     try {
//       const response = await context.storefront.query(LOAD_ALL_COLLECTIONS_QUERY, {
//         variables: { cursor },
//       });
//      console.log('Query response:', JSON.stringify(response, null, 2));  // Log the response
//       if (response != null) {
//         console.log('in fetchAllCollection if()')
//         const { edges, pageInfo } = response.collections;
//         allCollections = allCollections.concat(edges.map(edge => edge.node));
//         hasNextPage = pageInfo.hasNextPage;
//         cursor = pageInfo.endCursor;
//       } else {
//         console.error('No collections found in the response');
//         hasNextPage = false;  // Stop the loop if no collections found
//       }
//     } catch (error) {
//       console.error('****Error fetching collections:', error);
//       hasNextPage = false;  // Stop the loop on error
//     }
//   }

//   return allCollections;
// }
// const LOAD_ALL_COLLECTIONS_QUERY = `#graphql
//   query LoadAllCollections($cursor: String) {
//     collections(first: 5, after: $cursor) {
//       pageInfo {
//         hasNextPage
//         endCursor
//       }
//       edges {
//         node {
//           id
//           title
//           handle
//           updatedAt
//           products(first: 5) {
//             edges {
//               node {
//                 id
//                 title
//                 handle
//                 priceRange {
//                   minVariantPrice {
//                     amount
//                     currencyCode
//                   }
//                 }
//                 images(first: 1) {
//                   edges {
//                     node {
//                       src
//                       altText
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;

