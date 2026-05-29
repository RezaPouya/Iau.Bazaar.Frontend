import type { ApiResponse } from '~/types/api';

import type { LoginResponse } from '~/types/auth';

export const useAccountService = () => {
  const { $api } = useNuxtApp();

  /*
    |--------------------------------------------------------------------------
    | Sign In
    |--------------------------------------------------------------------------
    */

  const signInByPassword = async (payload: {
    userName: string;
    password: string;
  }) => {
    const response = await $api.post<ApiResponse<LoginResponse>>(
      '/account/sign-in-by-password',
      payload
    );

    return response.data;
  };

  /*
    |--------------------------------------------------------------------------
    | Refresh Token
    |--------------------------------------------------------------------------
    */

  const refreshToken = async (payload: { refreshToken: string }) => {
    const response = await $api.post<ApiResponse<LoginResponse>>(
      '/account/refresh-token',
      payload
    );

    return response.data;
  };

  return {
    signInByPassword,
    refreshToken,
  };
};
