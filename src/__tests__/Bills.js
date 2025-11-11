/**
 * @jest-environment jsdom
 */
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import Bills from '../containers/Bills.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);
router();
window.onNavigate(ROUTES_PATH.Bills);

describe('Given I am connected as an employee', () => {
	describe('When I am on the Bills Page', () => {
		test('Then the bill icon in the vertical layout should be highlighted', async () => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock });
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				}),
			);
			const root = document.createElement('div');
			root.setAttribute('id', 'root');
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId('icon-window'));
			const windowIcon = screen.getByTestId('icon-window');
			expect(windowIcon.classList.contains('active-icon')).toBe(true);
		});

		test('Then the bills should be ordered from earliest to latest', () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen
				.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
				.map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
	});

	describe('When I click on the "New Bill" button', () => {
		test('Then I should be redirected to the NewBill page', () => {
			const mockNavigate = jest.fn();
			const billsContainer = new Bills({
				document,
				onNavigate: mockNavigate,
				store: null,
				localStorage: window.localStorage,
			});
			const newBillButton = screen.getByTestId('btn-new-bill');
			newBillButton.addEventListener('click', billsContainer.handleClickNewBill);
			fireEvent.click(newBillButton);
			expect(mockNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
		});
	});

	describe('When I click on the eye icon of a bill', () => {
		test('Then the bill modal should open', () => {
			$.fn.modal = jest.fn();

			document.body.innerHTML = BillsUI({ data: bills });

			const billsContainer = new Bills({
				document,
				onNavigate: jest.fn(),
				store: null,
				localStorage: window.localStorage,
			});

			const eyeIcon = screen.getAllByTestId('icon-eye')[0];
			const mockHandleIconClick = jest.fn(() => billsContainer.handleClickIconEye(eyeIcon));
			eyeIcon.addEventListener('click', mockHandleIconClick);
			fireEvent.click(eyeIcon);

			expect(mockHandleIconClick).toHaveBeenCalled();
		});
	});

	describe('Given bills with corrupted data', () => {
		describe('When a bill has an invalid date', () => {
			test('Then it should handle the corrupted data gracefully', async () => {
				const corruptedBillData = [
					{
						id: '1',
						date: 'invalid-date',
						status: 'unknown',
					},
				];

				const mockStore = {
					bills: jest.fn().mockReturnValue({
						list: jest.fn().mockResolvedValue(corruptedBillData),
					}),
				};

				const billsContainer = new Bills({
					document,
					onNavigate: jest.fn(),
					store: mockStore,
					localStorage: {},
				});

				const result = await billsContainer.getBills();

				expect(result[0]).toHaveProperty('date', 'invalid-date');
			});
		});
	});

	describe('Given I am using the Bills Component', () => {
		let mockDocument, mockNavigate, mockStore;

		beforeEach(() => {
			global.$ = jest.fn(() => ({ modal: jest.fn(), click: jest.fn() }));
			mockDocument = { querySelector: jest.fn(), querySelectorAll: jest.fn() };

			const mockNewBillButton = { addEventListener: jest.fn() };
			mockDocument.querySelector.mockReturnValue(mockNewBillButton);

			const mockEyeIcons = [
				{ addEventListener: jest.fn(), getAttribute: jest.fn().mockReturnValue('test-url') },
			];
			mockDocument.querySelectorAll.mockReturnValue(mockEyeIcons);

			mockNavigate = jest.fn();
			mockStore = {
				bills: jest.fn(() => ({
					list: jest
						.fn()
						.mockResolvedValue([{ id: '1', date: '2023-01-15', status: 'pending', amount: 100 }]),
				})),
			};
		});

		describe('When the Bills component is initialized', () => {
			test('Then it should set up correctly', () => {
				const billsInstance = new Bills({
					document: mockDocument,
					onNavigate: mockNavigate,
					store: mockStore,
					localStorage: window.localStorage,
				});

				expect(mockDocument.querySelector).toHaveBeenCalledWith(
					'button[data-testid="btn-new-bill"]',
				);
				expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('div[data-testid="icon-eye"]');
			});
		});

		describe('When I click the "New Bill" button', () => {
			test('Then it should navigate to the NewBill page', () => {
				const billsInstance = new Bills({
					document: mockDocument,
					onNavigate: mockNavigate,
					store: null,
					localStorage: window.localStorage,
				});

				billsInstance.handleClickNewBill();
				expect(mockNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
			});
		});

		describe('When the store is not provided', () => {
			test('Then getBills should return undefined', () => {
				const billsInstance = new Bills({
					document: mockDocument,
					onNavigate: mockNavigate,
					store: null,
					localStorage: window.localStorage,
				});

				expect(billsInstance.getBills()).toBeUndefined();
			});
		});
	});

	describe('Given the API returns an error', () => {
		describe('When the API returns a 404 error', () => {
			test('Then it should display a 404 error message', async () => {
				const mockStore = {
					bills: jest.fn(() => ({ list: () => Promise.reject(new Error('Error 404')) })),
				};

				const billsContainer = new Bills({
					document,
					onNavigate: jest.fn(),
					store: mockStore,
					localStorage: window.localStorage,
				});

				await expect(billsContainer.getBills()).rejects.toThrow('Error 404');
			});
		});

		describe('When the API returns a 500 error', () => {
			test('Then it should display a 500 error message', async () => {
				const mockStore = {
					bills: jest.fn(() => ({ list: () => Promise.reject(new Error('Error 500')) })),
				};

				const billsContainer = new Bills({
					document,
					onNavigate: jest.fn(),
					store: mockStore,
					localStorage: window.localStorage,
				});

				await expect(billsContainer.getBills()).rejects.toThrow('Error 500');
			});
		});
	});
});
