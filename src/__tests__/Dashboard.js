/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import DashboardFormUI from '../views/DashboardFormUI.js';
import DashboardUI from '../views/DashboardUI.js';
import Dashboard, { cards, filteredBills, card } from '../containers/Dashboard.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';
import { bills } from '../fixtures/bills';
import router from '../app/Router';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an Admin', () => {
	describe('When I am on Dashboard page and there are bills', () => {
		describe('When there is one pending bill', () => {
			test('Then filteredBills by pending status should return 1 bill', () => {
				const filtered_bills = filteredBills(bills, 'pending');
				expect(filtered_bills.length).toBe(1);
			});
		});

		describe('When there is one accepted bill', () => {
			test('Then filteredBills by accepted status should return 1 bill', () => {
				const filtered_bills = filteredBills(bills, 'accepted');
				expect(filtered_bills.length).toBe(1);
			});
		});

		describe('When there are two refused bills', () => {
			test('Then filteredBills by refused status should return 2 bills', () => {
				const filtered_bills = filteredBills(bills, 'refused');
				expect(filtered_bills.length).toBe(2);
			});
		});

		describe('When the Dashboard page is loading', () => {
			test('Then the Loading page should be rendered', () => {
				document.body.innerHTML = DashboardUI({ loading: true });
				expect(screen.getAllByText('Loading...')).toBeTruthy();
			});
		});

		describe('When the back-end sends an error message', () => {
			test('Then the Error page should be rendered', () => {
				document.body.innerHTML = DashboardUI({ error: 'some error message' });
				expect(screen.getAllByText('Erreur')).toBeTruthy();
			});
		});

		describe('When I click on an arrow', () => {
			test('Then the ticket list should unfold and cards should appear', async () => {
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				Object.defineProperty(window, 'localStorage', { value: localStorageMock });
				window.localStorage.setItem('user', JSON.stringify({ type: 'Admin' }));

				const dashboard = new Dashboard({
					document,
					onNavigate,
					store: null,
					bills: bills,
					localStorage: window.localStorage,
				});

				document.body.innerHTML = DashboardUI({ data: { bills } });

				const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1));
				const handleShowTickets2 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 2));
				const handleShowTickets3 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 3));
				const icon1 = screen.getByTestId('arrow-icon1');
				const icon2 = screen.getByTestId('arrow-icon2');
				const icon3 = screen.getByTestId('arrow-icon3');

				icon1.addEventListener('click', handleShowTickets1);
				userEvent.click(icon1);
				expect(handleShowTickets1).toHaveBeenCalled();
				await waitFor(() => screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`));
				expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy();

				icon2.addEventListener('click', handleShowTickets2);
				userEvent.click(icon2);
				expect(handleShowTickets2).toHaveBeenCalled();
				await waitFor(() => screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`));
				expect(screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`)).toBeTruthy();

				icon3.addEventListener('click', handleShowTickets3);
				userEvent.click(icon3);
				expect(handleShowTickets3).toHaveBeenCalled();
				await waitFor(() => screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`));
				expect(screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`)).toBeTruthy();
			});
		});

		describe('When I click on the edit icon of a card', () => {
			test('Then the correct form should be filled', () => {
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				Object.defineProperty(window, 'localStorage', { value: localStorageMock });
				window.localStorage.setItem('user', JSON.stringify({ type: 'Admin' }));

				const dashboard = new Dashboard({
					document,
					onNavigate,
					store: null,
					bills: bills,
					localStorage: window.localStorage,
				});

				document.body.innerHTML = DashboardUI({ data: { bills } });

				const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1));
				const icon1 = screen.getByTestId('arrow-icon1');
				icon1.addEventListener('click', handleShowTickets1);
				userEvent.click(icon1);
				expect(handleShowTickets1).toHaveBeenCalled();
				expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy();

				const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro');
				userEvent.click(iconEdit);
				expect(screen.getByTestId('dashboard-form')).toBeTruthy();
			});
		});

		describe('When I click twice on the edit icon of a card', () => {
			test('Then the big bill icon should appear', () => {
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				Object.defineProperty(window, 'localStorage', { value: localStorageMock });
				window.localStorage.setItem('user', JSON.stringify({ type: 'Admin' }));

				const dashboard = new Dashboard({
					document,
					onNavigate,
					store: null,
					bills: bills,
					localStorage: window.localStorage,
				});

				document.body.innerHTML = DashboardUI({ data: { bills } });

				const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1));
				const icon1 = screen.getByTestId('arrow-icon1');
				icon1.addEventListener('click', handleShowTickets1);
				userEvent.click(icon1);
				expect(handleShowTickets1).toHaveBeenCalled();
				expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy();

				const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro');
				userEvent.click(iconEdit);
				userEvent.click(iconEdit);
				const bigBilledIcon = screen.queryByTestId('big-billed-icon');
				expect(bigBilledIcon).toBeTruthy();
			});
		});

		describe('When there are no bills', () => {
			test('Then no cards should be shown', () => {
				document.body.innerHTML = cards([]);
				const iconEdit = screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro');
				expect(iconEdit).toBeNull();
			});
		});
	});
});

describe('Given I am connected as Admin and I clicked on a pending bill', () => {
	describe('When I click on the accept button', () => {
		test('Then I should be sent to the Dashboard instead of the form', () => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			window.localStorage.setItem('user', JSON.stringify({ type: 'Admin' }));
			document.body.innerHTML = DashboardFormUI(bills[0]);

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;

			const dashboard = new Dashboard({
				document,
				onNavigate,
				store,
				bills,
				localStorage: window.localStorage,
			});

			const acceptButton = screen.getByTestId('btn-accept-bill-d');
			const handleAcceptSubmit = jest.fn((e) => dashboard.handleAcceptSubmit(e, bills[0]));
			acceptButton.addEventListener('click', handleAcceptSubmit);
			fireEvent.click(acceptButton);
			expect(handleAcceptSubmit).toHaveBeenCalled();

			const bigBilledIcon = screen.queryByTestId('big-billed-icon');
			expect(bigBilledIcon).toBeTruthy();
		});
	});

	describe('When I click on the refuse button', () => {
		test('Then I should be sent to the Dashboard instead of the form', () => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			window.localStorage.setItem('user', JSON.stringify({ type: 'Admin' }));
			document.body.innerHTML = DashboardFormUI(bills[0]);

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;

			const dashboard = new Dashboard({
				document,
				onNavigate,
				store,
				bills,
				localStorage: window.localStorage,
			});

			const refuseButton = screen.getByTestId('btn-refuse-bill-d');
			const handleRefuseSubmit = jest.fn((e) => dashboard.handleRefuseSubmit(e, bills[0]));
			refuseButton.addEventListener('click', handleRefuseSubmit);
			fireEvent.click(refuseButton);
			expect(handleRefuseSubmit).toHaveBeenCalled();

			const bigBilledIcon = screen.queryByTestId('big-billed-icon');
			expect(bigBilledIcon).toBeTruthy();
		});
	});
});

describe('Given I am connected as Admin and I am on the Dashboard page and I clicked on a bill', () => {
	describe('When I click on the eye icon', () => {
		test('Then a modal should open', () => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			window.localStorage.setItem('user', JSON.stringify({ type: 'Admin' }));
			document.body.innerHTML = DashboardFormUI(bills[0]);

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const dashboard = new Dashboard({
				document,
				onNavigate,
				store,
				bills,
				localStorage: window.localStorage,
			});

			const handleClickIconEye = jest.fn(dashboard.handleClickIconEye);
			const eye = screen.getByTestId('icon-eye-d');
			eye.addEventListener('click', handleClickIconEye);
			userEvent.click(eye);
			expect(handleClickIconEye).toHaveBeenCalled();

			const modal = screen.getByTestId('modaleFileAdmin');
			expect(modal).toBeTruthy();
		});
	});
});

describe('Given I am testing the card function', () => {
	test('Then it should render a bill card with the correct data', () => {
		const billData = {
			id: '1',
			email: 'john.doe@test.com',
			name: 'Test Bill',
			amount: 100,
			date: '2024-01-01',
			type: 'Transport',
		};

		const cardHTML = card(billData);

		expect(cardHTML).toContain('john');
		expect(cardHTML).toContain('doe');
		expect(cardHTML).toContain('Test Bill');
		expect(cardHTML).toContain('100 €');
		expect(cardHTML).toContain('Transport');
		expect(cardHTML).toContain('1 Jan. 24');
	});
});

describe('Given I am testing the getBillsAllUsers function', () => {
	test('Then it should handle null store', () => {
		const dashboard = new Dashboard({
			document,
			onNavigate: () => {},
			store: null,
			bills: [],
			localStorage: window.localStorage,
		});
		expect(dashboard.getBillsAllUsers()).toBeUndefined();
	});
});

describe('Given I am a user connected as Admin', () => {
	describe('When I navigate to Dashboard', () => {
		test('Then it fetches bills from mock API GET', async () => {
			localStorage.setItem('user', JSON.stringify({ type: 'Admin', email: 'a@a' }));
			const root = document.createElement('div');
			root.setAttribute('id', 'root');
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Dashboard);
			await waitFor(() => screen.getByText('Validations'));
			const contentPending = await screen.getByText('En attente (1)');
			expect(contentPending).toBeTruthy();
			const contentRefused = await screen.getByText('Refusé (2)');
			expect(contentRefused).toBeTruthy();
			expect(screen.getByTestId('big-billed-icon')).toBeTruthy();
		});
	});

	describe('When an error occurs on the API', () => {
		beforeEach(() => {
			jest.spyOn(mockStore, 'bills');
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			window.localStorage.setItem('user', JSON.stringify({ type: 'Admin', email: 'a@a' }));
			const root = document.createElement('div');
			root.setAttribute('id', 'root');
			document.body.appendChild(root);
			router();
		});

		describe('When the API returns a 404 error', () => {
			test('Then it should display the error message', async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error('Erreur 404'));
						},
					};
				});
				window.onNavigate(ROUTES_PATH.Dashboard);
				await new Promise(process.nextTick);
				const message = await screen.getByText(/Erreur 404/);
				expect(message).toBeTruthy();
			});
		});

		describe('When the API returns a 500 error', () => {
			test('Then it should display the error message', async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error('Erreur 500'));
						},
					};
				});

				window.onNavigate(ROUTES_PATH.Dashboard);
				await new Promise(process.nextTick);
				const message = await screen.getByText(/Erreur 500/);
				expect(message).toBeTruthy();
			});
		});
	});
});
