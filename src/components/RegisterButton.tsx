// =============================================================================
// COMPONENTE REGISTER BUTTON - Module 4: Event Pass
// =============================================================================
// Botón para registrarse en un evento con actualización optimista.
//
// ## useOptimistic (React 19)
// Este hook permite actualizar la UI inmediatamente antes de que
// la operación del servidor complete. Si falla, React revierte
// automáticamente al estado anterior.
//
// ## Patrón de Actualización Optimista
// 1. Usuario hace clic
// 2. UI se actualiza inmediatamente (optimistic)
// 3. Server Action se ejecuta
// 4. Si falla, UI se revierte automáticamente
// 5. Si éxito, estado se confirma
// =============================================================================

'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { registerForEventAction } from '@/actions/eventActions';
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterButtonProps {
  eventId: string;
  availableSpots: number;
  isAvailable: boolean;
}

/**
 * Botón de registro con actualización optimista.
 *
 * ## Flujo
 * 1. Al hacer clic, `addOptimistic` actualiza spots inmediatamente (-1)
 * 2. `startTransition` inicia la Server Action
 * 3. Mientras pending=true, mostramos spinner
 * 4. Si falla, React revierte automáticamente
 */
export function RegisterButton({
  eventId,
  availableSpots,
  isAvailable,
}: RegisterButtonProps): React.ReactElement {
  /**
   * useTransition permite marcar actualizaciones como no urgentes.
   * isPending indica si hay una transición en progreso.
   */
  const [isPending, startTransition] = useTransition();
  //guardamos el mensaje que nos devuelva el servidor
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  /**
   * useOptimistic crea un estado optimista.
   *
   * @param initialValue - Valor inicial (plazas disponibles)
   * @param reducer - Función que calcula el nuevo valor optimista
   */
  const [optimisticSpots, addOptimistic] = useOptimistic(
    availableSpots,
    // Reducer: cuando se registra, restamos 1
    (currentSpots: number, _action: 'register') => Math.max(0, currentSpots - 1)
  );

  // Estado derivado
  const showRegistered = optimisticSpots < availableSpots;
  const canRegister = isAvailable && optimisticSpots > 0 && !showRegistered;

  /**
   * Handler del registro.
   */

  // handleRegister (Corregido con startTransition)
  function handleRegister(): void {
    // 0. Limpiamos mensajes previos antes de intentar de nuevo
    setFeedback(null);

    startTransition(async () => {
      // 1. Actualización optimista inmediata
      addOptimistic('register');

      // 2. Llamada al servidor (tardará 2.2s por el retraso artificial)
      const result = await registerForEventAction(eventId);

      // 3. Manejo de la respuesta en la UI en lugar de solo la consola
      if (!result.success) {
        // Si falla, el estado optimista se revierte automáticamente
        setFeedback({ type: 'error', msg: result.message }); 
      } 
      else {
        // Mostramos success
        setFeedback({ type: 'success', msg: result.message });
      }
    });
  }

  // CÓDIGO ANTERIOR DE RETORNOS TEMPRANOS
  // // Si ya se registró (optimísticamente)
  // if (showRegistered) {
  //   return (
  //     <Button variant="secondary" disabled className="w-full gap-2">
  //       <CheckCircle className="h-4 w-4" />
  //       ¡Registrado!
  //     </Button>
  //   );
  // }
  //
  // // Si no hay plazas
  // if (!canRegister) {
  //   return (
  //     <Button variant="secondary" disabled className="w-full">
  //       {optimisticSpots === 0 ? 'Evento Agotado' : 'No disponible'}
  //     </Button>
  //   );
  // }
  //
  // return (
  //   <Button
  //     onClick={handleRegister}
  //     disabled={isPending}
  //     className={cn('w-full gap-2', isPending && 'cursor-wait')}
  //   >
  //     {isPending ? (
  //       <>
  //         <Loader2 className="h-4 w-4 animate-spin" />
  //         Registrando...
  //       </>
  //     ) : (
  //       `Registrarme (${optimisticSpots} plazas)`
  //     )}
  //   </Button>
  // );

  // ============================================================================
  // NUEVO CÓDIGO: Retornos tempranos con manejo de Spinner y Feedback (DoD)
  // ============================================================================
  
  // 1. ESTADO: Cargando (Spinner) 
  // Debe ir PRIMERO para interceptar el render mientras isPending es true
  if(isPending){
    return (
      <div className="w-full space-y-2">
        <Button disabled className="w-full gap-2 cursor-wait">
          <Loader2 className="h-4 w-4 animate-spin" />
          Registrando...
        </Button>
      </div>
    );
  }

  // 2. ESTADO: Registrado (Éxito)
  if(showRegistered || feedback?.type === 'success'){
    return (
      <div className="w-full space-y-2">
        <Button variant="secondary" disabled className="w-full gap-2">
          <CheckCircle className="h-4 w-4" />
          ¡Registrado!
        </Button>
        {/* Mostramos el mensaje de éxito del servidor */}
        {feedback?.type === 'success' && (
          <p className="text-xs text-center font-medium text-green-600">
            {feedback.msg}
          </p>
        )}
      </div>
    );
  }

  // 3. ESTADO: Sin plazas o agotado
  if(!canRegister){
    return (
      <div className="w-full space-y-2">
        <Button variant="secondary" disabled className="w-full">
          {availableSpots === 0 ? 'Evento Agotado' : 'No disponible'}
        </Button>
        {/* Mostramos error si el servidor falló porque se llenó justo en ese momento */}
        {feedback?.type === 'error' && (
          <p className="text-xs text-center font-medium text-red-500">
            {feedback.msg}
          </p>
        )}
      </div>
    );
  }

  // 4. ESTADO: Normal (Botón listo para hacer clic)
  return(
    <div className="w-full space-y-2">
      <Button 
        onClick={handleRegister} 
        disabled={isPending}
        className="w-full gap-2 transition-all hover:scale-105"
      >
        Registrarme ({optimisticSpots} plazas)
      </Button>
      {/* Mostramos el mensaje de error si la acción del servidor falló (ej. error de red) */}
      {feedback?.type === 'error' && (
        <p className="text-xs text-center font-medium text-red-500">
          {feedback.msg}
        </p>
      )}
    </div>
  );
}